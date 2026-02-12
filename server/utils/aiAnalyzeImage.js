import { analyzeImageSeverityGroq } from "./aiAnalyzeImageGroq.js";

export const analyzeImageSeverity = async (imageUrl) => {
    return await analyzeImageSeverityGroq(imageUrl);
};
