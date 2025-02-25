import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types

import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import * as route from "@arcgis/core/rest/route.js";

import Polygon from "@arcgis/core/geometry/Polygon.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import * as locator from "@arcgis/core/rest/locator.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Color from "@arcgis/core/Color";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import { FirebaseService, IDatabaseItem } from "src/app/pages/services/firebase";
import { Subscription } from "rxjs/internal/Subscription";

import Map from "@arcgis/core/Map";

declare global {
  interface Window {
    createRoute: (lat: number, long: number) => void;
  }
}

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  map: esri.Map;
  view: esri.MapView;
  graphicsLayer: esri.GraphicsLayer;
  graphicsLayerUserPoints: esri.GraphicsLayer;
  graphicsLayerRoutes: esri.GraphicsLayer;
  trailheadsLayer: esri.FeatureLayer;
  isConnected: boolean = false;
  subscriptionList: Subscription;
  subscriptionObj: Subscription;
  recyclingPointsLayer: GraphicsLayer;
  routeLayer: GraphicsLayer;
  routeUrl: string = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

  zoom = 10;
  center: Array<number> = [26.1025, 44.4268];
  basemap = "streets-vector";
  loaded = false;
  directionsElement: any;

  listItems: IDatabaseItem[] = [];

  constructor(
    private fbs: FirebaseService,
  ) { }

  loadPuncteColectareFromFirebase(): void {
    this.fbs.getPuncteColectare().subscribe((items: any[]) => {
      items.forEach((point) => {
        if (point.latitudine && point.longitudine) {
          this.addPointToMap(point.latitudine, point.longitudine, point.nume, point.descriere, {
            plastic: point.plastic,
            hartie: point.hartie,
            carti: point.carti,
            sticla: point.sticla,
            metal: point.metal,
            haine: point.haine,
            electronice: point.electronice,
            electrocasnice: point.electrocasnice,
            ochelari: point.ochelari,
            baterii: point.baterii,
            vapes: point.vapes,
            vopsea: point.vopsea,
            automobile: point.automobile,
            antigel: point.antigel,
            ulei: point.ulei,
            moloz: point.moloz,
            telefon: point.telefon,
            zileLucrate: point.zileLucrate,
            program: point.program,
            adresa: point.adresa,
          }
        );
        } else {
          console.warn("Invalid point coordinates: ", point);
        }
      });
    });
  }

  ngOnInit() {
    window.createRoute = (lat: number, long: number) => this.createRoute(lat, long); // Asociază metoda locală
    this.initializeMap().then(() => {
      this.loaded = this.view.ready;
      this.mapLoadedEvent.emit(true);
      
      this.connectFirebase();
      this.loadPuncteColectareFromFirebase();
      // this.view.on("click", (event) => this.addStopPoint(event.mapPoint));
    });
    this.loadPointsFromFirebase();
  }

  async initializeMap() {
    try {
      Config.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurO77SV1CDDDBsZgT2NUYqzxMixXz5DaQO1kRtePK4MR1KR4vNlLi14IzxQG77s3kc-2Q68b45Xdn7HEJV83QpDCBapDW9oaXok7NpVIOO_0TlqWr2_zhrkP5mtQbLNn6dfOUOdD8R71bzE8NoDYGvLbH10qQi5CGfmJygJXoPFCmusxujewetar6nGDchXTYc4aogvDWnSCvg5pwrx65Rfeb1976Y5zyplR4tS-oPtHtAT1_SZZW2aH3";
  
      const mapProperties: esri.WebMapProperties = {
        basemap: this.basemap
      };
      this.map = new WebMap(mapProperties);
  
      this.connectFirebase();
      this.addFeatureLayers();
      this.addGraphicsLayer();
  
      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map,
        ui: { components: ["attribution"] }, // Eliminăm toate componentele implicite, păstrăm doar atributul
      };
      this.view = new MapView(mapViewProperties);
  
      await this.view.when();
      console.log("ArcGIS map loaded");
  
      // Configurarea popup-ului
      if (this.view.popup.container instanceof HTMLElement) {
        this.view.popup.container.style.maxHeight = "400px"; // Setează dimensiunea maximă a popup-ului
      }
      this.view.popup.autoOpenEnabled = true; // Permite popup-urilor să se deschidă complet
  
      this.addRouting();
      this.filter();
      return this.view;
    } catch (error) {
      console.error("Error loading the map: ", error);
      alert("Error loading the map");
    }
  }

  loadPointsFromFirebase(): void {
    this.fbs.getChangeFeedList().subscribe((items: IDatabaseItem[]) => {
      items.forEach((point) => {
        if (point.lat && point.long) {
          this.addPointToMap(point.lat, point.long, point.name, point.val);
        }
      });
    });
  }

  addPointToMap(lat: number, long: number, name: string, description: string, details?: any): void {
    const point = new Point({
      latitude: lat,
      longitude: long
    });
  
    const markerSymbol = new SimpleMarkerSymbol({
      color: [0, 150, 136],
      outline: {
        color: [255, 255, 255],
        width: 2
      }
    });

    const recyclableItems = details ? [
      details.plastic ? "plastic" : null,
      details.hartie ? "hartie" : null,
      details.carti ? "carti" : null,
      details.sticla ? "sticla" : null,
      details.metal ? "metal" : null,
      details.haine ? "haine" : null,
      details.electronice ? "electronice" : null,
      details.electrocasnice ? "electrocasnice" : null,
      details.ochelari ? "ochelari" : null,
      details.baterii ? "baterii" : null,
      details.vapes ? "vapes" : null,
      details.vopsea ? "vopsea" : null,
      details.automobile ? "automobile" : null,
      details.antigel ? "antigel" : null,
      details.ulei ? "ulei" : null,
      details.moloz ? "moloz" : null,
    ].filter(item => item !== null).join(", ") : "";

    const popupContent = (): HTMLElement => {
      const container = document.createElement("div");
      if (recyclableItems) {
        const recycleInfo = document.createElement("p");
        recycleInfo.innerHTML = `
                            ${recyclableItems ? `<strong> <span style="font-size: 1.5em; color: green;">Reciclează: </span> </strong> <span style="font-size: 1.4em; color: green;"> ${recyclableItems} </span> <br>` : ""}
                            `;  
        container.appendChild(recycleInfo);
      }
    
      const detailsList = document.createElement("p");
      detailsList.innerHTML = `
        <strong>Telefon:</strong> ${details.telefon || "N/A"}<br>
        <strong>Zile lucrătoare:</strong> ${details.zileLucrate || "N/A"}<br>
        <strong>Program:</strong> ${details.program || "N/A"}<br>
        <strong>Adresa:</strong> ${details.adresa || "N/A"}<br>
        <strong>Descriere:</strong> ${description}
      `;
      container.appendChild(detailsList);
    
      const routeButton = document.createElement("button");
      routeButton.className = "route-button";
      routeButton.innerText = "Creează rută";
      routeButton.onclick = () => window.createRoute(lat, long);
      container.appendChild(routeButton);
    
      return container;
    };
    
    // Atribuie popupContent la popup-ul punctului:
    const pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol,
      attributes: { name, description, recyclables: recyclableItems },
      popupTemplate: {
        title: name,
        content: popupContent
      }
    });

    const popupTemplate = {
      title: "{name}",
      content: (feature) => {
        const container = document.createElement("div");
        container.style.maxHeight = "none"; // Elimină restricția implicită de înălțime
        container.style.overflowY = "visible"; // Asigură vizibilitatea completă
    
        const routeButton = document.createElement("button");
        routeButton.className = "route-button";
        routeButton.innerText = "Creează rută";
        routeButton.style.width = "100%"; // Opțional: forțează lățimea completă pentru buton
        container.appendChild(routeButton);
    
        return container;
      }
    };


    this.graphicsLayer.add(pointGraphic);
  }

  createRoute(lat: number, long: number): void {
    // Închide popup-ul curent (dacă este deschis)
    this.view.popup.close();  

    const startPoint = new Point({
      latitude: 44.4268,
      longitude: 26.1025
    });
  
    const endPoint = new Point({
      latitude: lat,
      longitude: long
    });
  
    this.calculateRoute([startPoint, endPoint]);
  }

  filter(){
    const recyclableTypes = [
      { key: "plastic", label: "Plastic" },
      { key: "hartie", label: "Hârtie" },
      { key: "carti", label: "Cărți" },
      { key: "sticla", label: "Sticlă" },
      { key: "metal", label: "Metal" },
      { key: "haine", label: "Haine" },
      { key: "electronice", label: "Electronice" },
      { key: "electrocasnice", label: "Electrocasnice" },
      { key: "ochelari", label: "Ochelari" },
      { key: "baterii", label: "Baterii" },
      { key: "vapes", label: "Vapes" },
      { key: "vopsea", label: "Vopsea" },
      { key: "automobile", label: "Automobile" },
      { key: "antigel", label: "Antigel" },
      { key: "ulei", label: "Ulei" },
      { key: "moloz", label: "Moloz" },
    ];

    const filterContainer = document.createElement("div");
    filterContainer.setAttribute("class", "esri-widget");
    filterContainer.setAttribute("style", "padding: 10px; font-family: 'Avenir Next W00'; font-size: 1em");

    const dropdownButton = document.createElement("button");
    dropdownButton.innerText = "Arata filtre";
    dropdownButton.setAttribute("style", "margin-bottom: 10px; cursor: pointer;");

    const filtersDiv = document.createElement("div");
    filtersDiv.style.display = "none";

    dropdownButton.addEventListener("click", () => {
      const isVisible = filtersDiv.style.display === "block";
      filtersDiv.style.display = isVisible ? "none" : "block";
      dropdownButton.innerText = isVisible ? "Arata filtre" : "Ascunde filtre";
    });

    filterContainer.appendChild(dropdownButton);
    filterContainer.appendChild(filtersDiv);

    const selectAllCheckbox = document.createElement("input");
    selectAllCheckbox.type = "checkbox";
    selectAllCheckbox.id = "selectAll";
    selectAllCheckbox.checked = true;

    const selectAllLabel = document.createElement("label");
    selectAllLabel.setAttribute("for", "selectAll");
    selectAllLabel.innerText = "Selectează tot";

    filtersDiv.appendChild(selectAllCheckbox);
    filtersDiv.appendChild(selectAllLabel);

    this.applyFilters();

    const checkboxes: HTMLInputElement[] = [];
    recyclableTypes.forEach((type) => {
      const checkboxContainer = document.createElement("div");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = type.key;
      checkbox.value = type.key;

      const label = document.createElement("label");
      label.setAttribute("for", type.key);
      label.innerText = type.label;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      filtersDiv.appendChild(checkboxContainer);

      checkboxes.push(checkbox);

      // Adaugăm un eveniment de schimbare pe checkbox
      checkbox.addEventListener("change", () => {
        if(checkbox.checked){ 
          selectAllCheckbox.checked = false;
        } else {
          const areAllUnchecked = checkboxes.every(cb => !cb.checked);
          if(areAllUnchecked){
            selectAllCheckbox.checked = true;
          }
        }
        this.applyFilters();
      });

    });
    
    selectAllCheckbox.addEventListener("change", () => {
      if (selectAllCheckbox.checked) {
        // Debifăm toate celelalte checkbox-uri
        checkboxes.forEach((cb) => cb.checked = false);
      }
      this.applyFilters();
    });

    this.view.ui.add(filterContainer, "top-left");
  }

  applyFilters() {
    const selectAllCheckbox = document.getElementById("selectAll") as HTMLInputElement;
    const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .map((checkbox: any) => checkbox.value);
  
    if (this.graphicsLayer) {
      this.graphicsLayer.graphics.forEach((graphic) => {
        const graphicRecyclables = graphic.attributes.recyclables || "";
        const recyclablesArray = graphicRecyclables.split(", ").map(item => item.trim());
  
        if (selectAllCheckbox.checked) {
          // Arătăm toate punctele dacă "Selectează toate filtrele" e bifat
          graphic.visible = true;
        } else {
          // Filtrăm punctele pe baza checkbox-urilor selectate
          const matches = selectedTypes.some((type) => recyclablesArray.includes(type));
          graphic.visible = selectedTypes.length === 0 || matches;
        }
      });
    }
  }

  addFeatureLayers() {
    this.trailheadsLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
      outFields: ['*']
    });
    this.map.add(this.trailheadsLayer);

    const trailsLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
    });
    this.map.add(trailsLayer, 0);

    const parksLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
    });
    this.map.add(parksLayer, 0);

    console.log("Feature layers added");
  }

  addGraphicsLayer() {
    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);
    this.graphicsLayerUserPoints = new GraphicsLayer();
    this.map.add(this.graphicsLayerUserPoints);
    this.graphicsLayerRoutes = new GraphicsLayer();
    this.map.add(this.graphicsLayerRoutes);
    this.recyclingPointsLayer = new GraphicsLayer();
    this.map.add(this.recyclingPointsLayer);
    this.routeLayer = new GraphicsLayer();
    this.map.add(this.routeLayer);
  }

  addStopPoint(mapPoint: Point) {
    const stopSymbol = {
      type: "simple-marker",
      color: this.graphicsLayer.graphics.length === 0 ? "white" : "black",
      size: "8px",
    };
    const stopGraphic = new Graphic({
      geometry: mapPoint,
      symbol: stopSymbol,
    });

    this.graphicsLayer.add(stopGraphic);

    if (this.graphicsLayer.graphics.length === 2) {
      this.getRoute();
    } else if (this.graphicsLayer.graphics.length > 2) {
      this.graphicsLayer.removeAll();
      this.graphicsLayer.add(stopGraphic);
    }
  } 

  resetView() {
    // Elimină direcțiile afișate
    if (this.directionsElement) {
      this.view.ui.remove(this.directionsElement);
      this.directionsElement = null;
    }
  
    // Elimină traseele de pe hartă
    if (this.graphicsLayerRoutes) {
      this.graphicsLayerRoutes.removeAll();
    }
  
    // Elimină punctele utilizatorului
    if (this.graphicsLayerUserPoints) {
      this.graphicsLayerUserPoints.removeAll();
    }
  
    console.log("Traseul și direcțiile au fost eliminate.");

    // Reafișăm filtrul
    const filterContainer = document.querySelector(".esri-widget") as HTMLElement;
    if (filterContainer) {
      filterContainer.style.display = "block"; // Asigurăm că filtrele sunt vizibile din nou
    } else {
      // Dacă filtrul a fost eliminat complet, îl re-adăugăm
      this.filter(); // Reapelăm funcția `filter()` pentru re-creare
    }
  }

  getRoute() {
    const stops = this.graphicsLayer.graphics.toArray();
    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: stops,
      }),
      returnDirections: true,
    });

    route.solve(this.routeUrl, routeParams).then((data) => {
      data.routeResults.forEach((result) => {
        result.route.symbol = new SimpleLineSymbol({
          color: new Color([5, 150, 255, 1]), // Folosește Color explicit
        });
        this.graphicsLayer.add(result.route);
      });

      if (data.routeResults.length > 0) {
        this.displayDirections(data.routeResults[0].directions.features);
      }
    });
  }

  displayDirections(directions: any[]) {
    // Creăm containerul pentru direcții
    this.directionsElement = document.createElement("div");
    this.directionsElement.classList.add("esri-widget", "esri-widget--panel", "esri-directions__scroller");
    
    // Setăm poziționarea manuală în partea stângă jos
    this.directionsElement.style.position = "fixed";
    this.directionsElement.style.bottom = "20px";
    this.directionsElement.style.left = "20px";
    this.directionsElement.style.padding = "15px";
    this.directionsElement.style.maxHeight = "200px";
    this.directionsElement.style.overflowY = "auto";
    this.directionsElement.style.backgroundColor = "white";
    this.directionsElement.style.boxShadow = "0px 2px 6px rgba(0, 0, 0, 0.3)";
    this.directionsElement.style.zIndex = "999"; // Ne asigurăm că este deasupra altor elemente UI
  
    const directionsList = document.createElement("ol");
    directions.forEach((step) => {
      const directionStep = document.createElement("li");
      directionStep.innerText = `${step.attributes.text} (${step.attributes.length.toFixed(2)} km)`;
      directionsList.appendChild(directionStep);
    });
  
    // Adăugăm lista la container
    this.directionsElement.appendChild(directionsList);
  
    // Butonul "X" pentru închidere
    const closeButton = document.createElement("button");
    closeButton.innerText = "X";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "5px";
    closeButton.style.background = "red";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.padding = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = () => this.resetView(); // Apelăm `resetView()` pentru a șterge direcțiile și a reafișa filtrele
  
    // Adăugăm butonul la container
    this.directionsElement.appendChild(closeButton);
  
    // Adăugăm containerul în UI
    document.body.appendChild(this.directionsElement); // Atașăm manual la body
  }
  

  removeTraseu() {
    if (this.graphicsLayer) {
      this.graphicsLayer.removeAll();
    }
    this.graphicsLayerRoutes.removeAll(); 
    this.graphicsLayerUserPoints.removeAll();
    this.graphicsLayerUserPoints.graphics.removeAll();
    this.removePoints();

    const directionsElement = document.querySelector(".esri-directions__scroller");
    if (directionsElement) {
      directionsElement.remove();
      console.log("Tabela cu direcții a fost ștearsă.");
    }
  }


  addRouting() {
    const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
    this.view.on("click", (event) => {
      this.view.hitTest(event).then((elem: esri.HitTestResult) => {
        if (elem && elem.results && elem.results.length > 0) {
          const point: esri.Point = elem.results.find(e => e.layer === this.trailheadsLayer)?.mapPoint;
          if (point) {
            console.log("get selected point: ", elem, point);
            if (this.graphicsLayerUserPoints.graphics.length === 0) {
              this.addPoint(point.latitude, point.longitude);
            } else if (this.graphicsLayerUserPoints.graphics.length === 1) {
              this.addPoint(point.latitude, point.longitude);
              const points = Array.from(this.graphicsLayerUserPoints.graphics).map((graphic) => graphic.geometry as Point);
              this.calculateRoute(points);
            } else {
              this.removePoints();
            }
          }
        }
      });
    });
  }

  addPoint(lat: number, lng: number) {
    let point = new Point({
      longitude: lng,
      latitude: lat
    });

    const simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1
      }
    };

    let pointGraphic: esri.Graphic = new Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol
    });

    this.graphicsLayerUserPoints.add(pointGraphic);
  }

  removePoints() {
    this.graphicsLayerUserPoints.removeAll();
  }

  // async calculateRoute(routeUrl: string) {
  //   const routeParams = new RouteParameters({
  //     stops: new FeatureSet({
  //       features: this.graphicsLayerUserPoints.graphics.toArray()
  //     }),
  //     returnDirections: true
  //   });

  //   try {
  //     const data = await route.solve(routeUrl, routeParams);
  //     this.displayRoute(data);
  //   } catch (error) {
  //     console.error("Error calculating route: ", error);
  //     alert("Error calculating route");
  //   }
  // }

  async calculateRoute(points: Point[]): Promise<void> {
    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: points.map((point) => new Graphic({ geometry: point }))
      }),
      returnDirections: true
    });
  
    try {
      // Eliminăm toate rutele existente înainte de a crea una nouă
      this.graphicsLayerRoutes.removeAll(); 

      const data = await route.solve(this.routeUrl, routeParams);
      this.displayRoute(data);
    } catch (error) {
      console.error("Error calculating route: ", error);
      alert("Error calculating route");
    }
  }

  // displayRoute(data: any) {
  //   for (const result of data.routeResults) {
  //     result.route.symbol = {
  //       type: "simple-line",
  //       color: [5, 150, 255],
  //       width: 3
  //     };
  //     this.graphicsLayerRoutes.graphics.add(result.route);
  //   }
  //   if (data.routeResults.length > 0) {
  //     this.showDirections(data.routeResults[0].directions.features);
  //   } else {
  //     alert("No directions found");
  //   }
  // }

  displayRoute(data: any): void {
    data.routeResults.forEach((result) => {
      result.route.symbol = new SimpleLineSymbol({
        color: [5, 150, 255],
        width: 3
      });
      this.graphicsLayerRoutes.add(result.route);
    });
  
    if (data.routeResults.length > 0) {
      this.showDirections(data.routeResults[0].directions.features);
    } else {
      alert("No directions found");
    }
  }

  clearFilters() {
    if (this.view) {
      // Remove all graphics related to Filters
      if(this.graphicsLayer)
      {
        this.graphicsLayer.graphics.forEach((graphic) => {
          graphic.visible = true;
        });
      }

      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = false;
      });

      console.log("All filters cleared and checkboxes reset.");
    }
  }

  showDirections(features: any[]) {
    this.directionsElement = document.createElement("ol");
    this.directionsElement.classList.add("esri-widget", "esri-widget--panel", "esri-directions__scroller");
    this.directionsElement.style.marginTop = "0";
    this.directionsElement.style.padding = "15px 15px 15px 30px";

    features.forEach((result, i) => {
      const direction = document.createElement("li");
      direction.innerHTML = `${result.attributes.text} (${result.attributes.length} miles)`;
      this.directionsElement.appendChild(direction);
    });

    this.view.ui.empty("top-right");
    this.view.ui.add(this.directionsElement, "top-right");
  }

  connectFirebase() {
    if (this.isConnected) {
      return;
    }
    this.isConnected = true;
    this.fbs.connectToDatabase();
    this.fbs.getChangeFeedList().subscribe((items: IDatabaseItem[]) => {
        console.log("list updated: ", items);
        this.listItems = items;
    });


    this.subscriptionObj = this.fbs.getChangeFeedObject().subscribe((stat: IDatabaseItem) => {
        console.log("object updated: ", stat);
    });
  }

  disconnectFirebase() {
      if (this.subscriptionList != null) {
          this.subscriptionList.unsubscribe();
      }
      if (this.subscriptionObj != null) {
          this.subscriptionObj.unsubscribe();
      }
  }

  ngOnDestroy(): void {
    if (this.view) {
      this.view.container = null;
    }

    this.disconnectFirebase();
  }
}
