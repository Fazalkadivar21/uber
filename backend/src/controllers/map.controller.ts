import { Request, Response } from "express";
import { MapService } from "../service/map.service";

const mapService = new MapService(process.env.MAPBOX_API_KEY!);

export const getCoordinates = async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ message: "Location is required" });

    const coordinates = await mapService.getCoordinates(address as string);
    return res.status(200).json({ message: "Coordinates fetched successfully", coordinates });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get coordinates", error: (error as Error).message });
  }
};

export const getDistanceTime = async (req: Request, res: Response) => {
  try {
    const { originLat, originLng, destinationLat, destinationLng } = req.query;
    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return res.status(400).json({ message: "origin and destination required." });
    }

    const { distance, duration } = await mapService.getDistanceTime(
      { lat: Number(originLat), lng: Number(originLng) },
      { lat: Number(destinationLat), lng: Number(destinationLng) }
    );

    return res.status(200).json({ message: "Fetched successfully", distance, duration });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get distance/time", error: (error as Error).message });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { searchStr } = req.query;
    if (!searchStr) return res.status(400).json({ message: "search string is required" });

    const suggestions = await mapService.getSuggestions(searchStr as string);
    return res.status(200).json({ message: "Fetched successfully", suggestions });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get suggestions", error: (error as Error).message });
  }
};
