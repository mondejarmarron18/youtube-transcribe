import { timeToMs, msToTime } from "@/utils/time";

type Requests = Record<
  string,
  {
    expiredAt: number;
    remaining: number;
  }
>;

const requests: Requests = {};

const apiLimiter = async (
  req: Request,
  limit: number,
  windowMs: number,
  next: () => Promise<Response>
) => {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const url = new URL(req.url).pathname;
  const key = `${ip}:${url}`;

  if (!requests[key]) {
    requests[key] = {
      expiredAt: Date.now() + windowMs,
      remaining: limit,
    };
  }

  const { expiredAt, remaining } = requests[key];

  if (Date.now() < expiredAt) {
    if (remaining <= 0) {
      const timeLeft = msToTime(expiredAt - Date.now());

      return new Response(
        `We are providing limited access at the moment. You can try again after ${timeLeft}`,
        { status: 429 }
      );
    } else {
      requests[key] = {
        expiredAt,
        remaining: remaining - 1,
      };
    }
  } else {
    requests[key] = {
      expiredAt: Date.now() + windowMs,
      remaining: limit - 1,
    };
  }

  return next();
};

// Clean up expired entries
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const key in requests) {
    if (requests[key].expiredAt < now) {
      delete requests[key];
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredEntries, timeToMs.hours(1));

export default apiLimiter;
