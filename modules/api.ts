import fetch from "node-fetch";
import config from "../config.json";

export default class Api {
  public static async getRandomCat() {
    let json = fetch(config.settings.api.cat.url).then((res) => res.json());
    return json.then((json) => {
      return json[0].url;
    });
  }

  public static async getRandomCorgi() {

    let json = fetch(config.settings.api.corgi.url).then((res) => res.json());
    return json.then((json) => {
      return json.message;
    });

  }
}
