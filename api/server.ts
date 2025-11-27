import express from "express";
import health from "./health/index";
import cipher from "./cipher/index";

const app = express();

app.use("/health", health);
app.use("/cipher", cipher);

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`[RLD] API listening on ${port}`));
