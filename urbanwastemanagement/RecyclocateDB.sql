USE [master]
GO
/****** Object:  Database [RecyclocateDB]    Script Date: 12/1/2024 11:36:13 PM ******/
CREATE DATABASE [RecyclocateDB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'RecyclocateDB', FILENAME = N'D:\SQL Server\MSSQL14.SQLEXPRESS\MSSQL\DATA\RecyclocateDB.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'RecyclocateDB_log', FILENAME = N'D:\SQL Server\MSSQL14.SQLEXPRESS\MSSQL\DATA\RecyclocateDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [RecyclocateDB] SET COMPATIBILITY_LEVEL = 140
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [RecyclocateDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [RecyclocateDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [RecyclocateDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [RecyclocateDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [RecyclocateDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [RecyclocateDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [RecyclocateDB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [RecyclocateDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [RecyclocateDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [RecyclocateDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [RecyclocateDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [RecyclocateDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [RecyclocateDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [RecyclocateDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [RecyclocateDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [RecyclocateDB] SET  DISABLE_BROKER 
GO
ALTER DATABASE [RecyclocateDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [RecyclocateDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [RecyclocateDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [RecyclocateDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [RecyclocateDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [RecyclocateDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [RecyclocateDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [RecyclocateDB] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [RecyclocateDB] SET  MULTI_USER 
GO
ALTER DATABASE [RecyclocateDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [RecyclocateDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [RecyclocateDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [RecyclocateDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [RecyclocateDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [RecyclocateDB] SET QUERY_STORE = OFF
GO
USE [RecyclocateDB]
GO
/****** Object:  Table [dbo].[PuncteColectare]    Script Date: 12/1/2024 11:36:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PuncteColectare](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Nume] [varchar](255) NOT NULL,
	[Plastic] [varchar](3) NULL,
	[Hartie] [varchar](3) NULL,
	[Carti] [varchar](3) NULL,
	[Sticla] [varchar](3) NULL,
	[Metal] [varchar](3) NULL,
	[Haine] [varchar](3) NULL,
	[Electronice] [varchar](3) NULL,
	[Electrocasnice] [varchar](3) NULL,
	[Ochelari] [varchar](3) NULL,
	[Baterii] [varchar](3) NULL,
	[Vapes] [varchar](3) NULL,
	[Vopsea] [varchar](3) NULL,
	[Automobile] [varchar](3) NULL,
	[Antigel] [varchar](3) NULL,
	[Ulei] [varchar](3) NULL,
	[Moloz] [varchar](3) NULL,
	[ZileLucrate] [varchar](255) NULL,
	[Program] [varchar](255) NULL,
	[Adresa] [varchar](255) NULL,
	[Latitudine] [varchar](255) NULL,
	[Longitudine] [varchar](255) NULL,
	[Descriere] [varchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Recyclocate]    Script Date: 12/1/2024 11:36:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Recyclocate](
	[Nume] [varchar](50) NULL,
	[Plastic] [varchar](50) NULL,
	[Hartie Si Carton] [varchar](50) NULL,
	[Carti] [varchar](50) NULL,
	[Sticla] [varchar](50) NULL,
	[Metal] [varchar](50) NULL,
	[Haine] [varchar](50) NULL,
	[Electronice] [varchar](50) NULL,
	[Electrocasnice] [varchar](50) NULL,
	[Ochelari] [varchar](50) NULL,
	[Baterii] [varchar](50) NULL,
	[Vape-uri] [varchar](50) NULL,
	[Vopsea] [varchar](50) NULL,
	[Automobile] [varchar](50) NULL,
	[Antigel] [varchar](50) NULL,
	[Ulei] [varchar](50) NULL,
	[Moloz] [varchar](50) NULL,
	[Telefon] [varchar](50) NULL,
	[Zile Lucrate] [varchar](50) NULL,
	[Program] [varchar](50) NULL,
	[Adresa] [varchar](50) NULL,
	[Latitudine] [varchar](50) NULL,
	[Longitudine] [varchar](50) NULL,
	[Descriere] [varchar](50) NULL
) ON [PRIMARY]
GO
USE [master]
GO
ALTER DATABASE [RecyclocateDB] SET  READ_WRITE 
GO
