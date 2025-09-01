import { errorExit, notify, run } from "./src/main/app";

run().then(notify).catch(errorExit);
