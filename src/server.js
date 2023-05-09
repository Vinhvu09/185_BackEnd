import mongoose from "mongoose";
import app from "./app.js";

process.on("uncaughtException", (error) => {
  console.log(error);
  process.exit(1);
});

const url = process.env.MONGGODB_URL.replace(
  "<password>",
  process.env.MONGODB_PASSWORD
);

mongoose
  .connect(url)
  .then(() => {
    console.log("Connect DB success!");

    const port = process.env.PORT || 4000;
    const server = app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });

    process.on("rejectionHandled", (error) => {
      console.log(error);
      server.close((err) => {
        process.exit(1);
      });
    });
  })
  .catch((err) => console.log("Connect DB failed!"));
