import config from "./src/config/config.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

await connectDB();

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});