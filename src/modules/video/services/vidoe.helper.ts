import { Types } from "mongoose";
import { CustomError } from "../../../utils/errorHandling";
import { Isection } from "../../../DB/interfaces/videos.interface";

export const handleVideoAndThumbnail = async (
  originalname: string,
  section: Isection,
  videoId: Types.ObjectId,
  videoTitle: string
) => {
  const videoFilePath = `/courses/${section.courseId}/sections/${
    section._id
  }/videos/${videoId}/video-${videoId}-${videoTitle.replace(
    /\s/g,
    "-"
  )}-${originalname.replace(/\s/g, "-")}`;

  return { videoFilePath };
};
