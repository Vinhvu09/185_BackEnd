import path from "path";

const config = {
  rootPath: process.cwd(),
  imagePath: path.join(process.cwd(), "public", "images"),
  unityPath: path.join(process.cwd(), "public", "unity"),
};

export default config;
