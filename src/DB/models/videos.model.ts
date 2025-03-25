import mongoose, { Schema } from "mongoose";
import { Isection, IVideo } from "../interfaces/videos.interface";

const sectionSchema = new mongoose.Schema<Isection>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    totalVideos: { type: Number, required: true, default: 0 },
    title: { type: String, required: true },
    order: { type: Number, required: false },
  },
  { timestamps: true }
);

const VideoSchema = new Schema<IVideo>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "section",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 300,
    },
    video_key: {
      type: String,
      required: true,
    },
    order: { type: Number, required: false, min: 0, max: 300 },
  },
  { timestamps: true }
);

const videoModel = mongoose.model<IVideo>("video", VideoSchema);
const sectionModel = mongoose.model("section", sectionSchema);

export { videoModel, sectionModel };
