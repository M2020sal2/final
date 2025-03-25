import mongoose from "mongoose";

// Video Schema
export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  video_key: string;
  order?: number;
}

export interface Isection extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  totalVideos: number;
  title: string;
  order?: number;
}
