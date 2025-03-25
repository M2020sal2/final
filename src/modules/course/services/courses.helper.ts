import { Types } from "mongoose";
import { ICourse } from "../../../DB/interfaces/courses.interface";
import FileQueue from "../../../utils/uploadFile.queue";

export const courseKey = async (
  _id: Types.ObjectId,
  title: string,
  originalname: string
) => {
  const folder = `/courses/${_id}/${title.replace(
    /\s/g,
    "-"
  )}--${originalname.replace(/\s/g, "-")}`;
  
  return folder;
};

export const uploadFileToQueue = async (
  file: Express.Multer.File,
  model: any,
  key: string,
  value: string | Types.ObjectId
) => {
  try {
    const job = await FileQueue.add({
      file,
      model,
      key,
      value,
    });

    console.log(`✅ Job ${job.id} added to queue`);
  } catch (error) {
    console.error("❌ Error adding job to queue:", error);
  }
};
