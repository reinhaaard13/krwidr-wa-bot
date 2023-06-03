import axios from "axios";
import dotenv from "dotenv";
import { db } from "./FirebaseDatabase";
import { get, onValue, ref, set } from "firebase/database";
dotenv.config();

class ExchangeRate {
  BASE_URL = 'https://openexchangerates.org/api';
  axios = axios.create({
    baseURL: this.BASE_URL,
  })

  async getLatestRates() {
    const { data } = await this.axios.get<{
      disclaimer: string;
      license: string;
      timestamp: number;
      base: string;
      rates: {
        [key: string]: number;
      }
    }>("/latest.json", {
      params: {
        app_id: process.env.OPEN_EXCHANGE_APP_ID,
        base: "USD",
        symbols: "IDR,KRW"
      }
    })

    await set(ref(db, "exchange_rate"), {
      ...data,
      timestamp: new Date().toISOString()
    })

    return data;
  }

  async getIDRFromKRW(won: number) {
    const rates = await get(ref(db, "exchange_rate/rates"))

    return (rates.val().IDR / rates.val().KRW) * won;
  }

  async getKRWFromIDR(idr: number) {
    const rates = await get(ref(db, "exchange_rate/rates"))

    return (rates.val().KRW / rates.val().IDR) * idr;
  }
}

export default ExchangeRate