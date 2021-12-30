import fetch from "node-fetch";
import auth from "../data/auth.json";

export default class Api {
  public static async getRandomCat() {
    let json = fetch(auth.api.cat.url).then((res) => res.json());
    return json.then((json) => {
      return json[0].url;
    });
  }

  public static async getRandomCorgi() {

    let json = fetch(auth.api.corgi.url).then((res) => res.json());
    return json.then((json) => {
      return json.message;
    });

  }
}
