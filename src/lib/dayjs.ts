import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import localFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/id"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("id")
dayjs.extend(localFormat);
dayjs.tz.setDefault("Asia/Jakarta")

export default dayjs