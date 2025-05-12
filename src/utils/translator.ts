import * as deepl from "deepl-node";

const translator = new deepl.Translator(`${process.env.DEEPL_API_KEY}`);

export default translator;
