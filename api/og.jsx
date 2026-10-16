/* Dynamic Open Graph image — AceWithBoye share card (1200×630) */
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const TYPE_LABELS = {
  slides: "Course Slides",
  notes: "Lecture Notes",
  "past-questions": "Past Questions",
  tutorials: "Tutorials",
  videos: "Videos",
  shared: "Shared Material",
};

function originFrom(req) {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const typeId = searchParams.get("type") || "shared";
  const typeLabel =
    searchParams.get("label") || TYPE_LABELS[typeId] || "Material";
  const code = (searchParams.get("code") || "EBB").trim();
  const name = (searchParams.get("name") || "Engineering Brain Bank").trim();

  const origin = originFrom(req);
  const boyeUrl = `${origin}/assets/og/boye-cutout.png`;
  const markUrl = `${origin}/assets/og/ace-wordmark.png`;
  const bpUrl = `${origin}/assets/og/blueprint-left-clean.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#080a0e",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Left panel — Boye */}
        <div
          style={{
            width: 540,
            height: "100%",
            display: "flex",
            position: "relative",
            background: "#0b0e14",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={bpUrl}
            width={540}
            height={630}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 540,
              height: 630,
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
          <img
            src={boyeUrl}
            width={420}
            height={608}
            style={{
              position: "relative",
              width: 420,
              height: 608,
              objectFit: "contain",
              objectPosition: "bottom center",
            }}
          />
        </div>

        {/* Seam */}
        <div
          style={{
            width: 1,
            height: 520,
            alignSelf: "center",
            background: "rgba(120,200,220,0.35)",
            display: "flex",
          }}
        />

        {/* Right stack */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px 56px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ghost code */}
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 200,
              fontSize: 140,
              fontWeight: 800,
              color: "rgba(120,200,220,0.09)",
              display: "flex",
              whiteSpace: "nowrap",
            }}
          >
            {code}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#78c8dc",
                textTransform: "uppercase",
                marginBottom: 10,
                display: "flex",
              }}
            >
              {String(typeLabel).toUpperCase()}
            </div>
            <div
              style={{
                width: 56,
                height: 3,
                background: "#78c8dc",
                marginBottom: 18,
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "#f8fafc",
                lineHeight: 1.05,
                marginBottom: 14,
                display: "flex",
              }}
            >
              {code}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 500,
                color: "#828c96",
                lineHeight: 1.25,
                maxWidth: 520,
                display: "flex",
              }}
            >
              {name.length > 70 ? name.slice(0, 67) + "…" : name}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 56,
              bottom: 36,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img src={markUrl} width={220} height={36} style={{ height: 36 }} />
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "#555f69",
                display: "flex",
              }}
            >
              Engineering Brain Bank · KB4GESA
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
