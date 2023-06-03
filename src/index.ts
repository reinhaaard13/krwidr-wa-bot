import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import ExchangeRate from "./lib/ExchangeRate";
import dayjs from "dayjs";

const exchangeRate = new ExchangeRate();

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
	const sock = makeWASocket({
		// can provide additional config here
		printQRInTerminal: true,
		auth: state
	});
	sock.ev.on("connection.update", (update) => {
		const { connection, lastDisconnect } = update;
		if (connection === "close") {
			const shouldReconnect =
				(lastDisconnect?.error as Boom)?.output?.statusCode !==
				DisconnectReason.loggedOut;
			console.log(
				"connection closed due to ",
				lastDisconnect?.error,
				", reconnecting ",
				shouldReconnect
			);
			// reconnect if not logged out
			if (shouldReconnect) {
				connectToWhatsApp();
			}
		} else if (connection === "open") {
			console.log("opened connection");
		}
	});
	sock.ev.on("messages.upsert", async (m) => {
    if (m.messages[0].key.fromMe) return;

    if (m.messages[0].message?.conversation?.startsWith("!update-rates")) {
      await sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: "Updating exchange rates...",
      });
      const data = await exchangeRate.getLatestRates();
      const replyText = `✅ Exchange rates updated!\n1KRW = ${(data.rates.IDR/data.rates.KRW).toFixed(2)}IDR\n\nLast updated at ${dayjs.unix(data.timestamp).format("DD MMM YYYY HH:mm:ss")}`
      await sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: replyText,
      });

      return;
    }

    if (m.messages[0].message?.conversation?.toLowerCase().startsWith("krw")) {
      const won = m.messages[0].message?.conversation?.split("krw ")[1].trim().replace(/[^0-9]/g, "");

      const idr = await exchangeRate.getIDRFromKRW(+won);

      const replyText = `💰 *KRW to IDR*\n${(+won).toLocaleString().split(".")[0]} KRW🇰🇷 = ${idr.toLocaleString().split(".")[0]} IDR🇮🇩`

      await sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: replyText,
      });

      return
    }

    if (m.messages[0].message?.conversation?.toLowerCase().startsWith("idr")) {
      const idr = m.messages[0].message?.conversation?.split("idr ")[1].trim().replace(/[^0-9]/g, "");

      const won = await exchangeRate.getKRWFromIDR(+idr);

      const replyText = `💰 *IDR to KRW*\n${(+idr).toLocaleString().split(".")[0]} IDR🇮🇩 = ${won.toLocaleString().split(".")[0]} KRW🇰🇷`

      await sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: replyText,
      });

      return
    }

    if (m.messages[0].message?.conversation?.toLowerCase().startsWith("!help")) {
      await sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: "👋 Hi, this is Rei's Whatsapp Bot! Prefix your message with 'krw' or 'idr' to convert currency.",
      });
      return
    }

	});

  sock.ev.on("groups.upsert", async (g) => {
    await sock.sendMessage(g[0].id, {
      text: "👋 Hi, this is Rei's Whatsapp Bot! Prefix your message with 'krw' or 'idr' to convert currency.",
    })
    return
  })  

  sock.ev.on("creds.update", saveCreds)
}
// run in main file
connectToWhatsApp();
