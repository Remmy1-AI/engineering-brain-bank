/* Dynamic Open Graph image — AceWithBoye card (1200×630), Edge runtime.
   Inlined compressed assets = no remote image fetches on cold start. */
import { ImageResponse } from "@vercel/og";
import React from "react";
import { BOYE, BLUEPRINT, WORDMARK } from "./og-assets.js";

export const config = { runtime: "edge" };

const h = React.createElement;

const TYPE_LABELS = {
  slides: "Course Slides",
  notes: "Lecture Notes",
  "past-questions": "Past Questions",
  tutorials: "Tutorials",
  videos: "Videos",
  shared: "Shared Material",
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const typeId = searchParams.get("type") || "shared";
    const typeLabel =
      searchParams.get("label") || TYPE_LABELS[typeId] || "Material";
    const code = (searchParams.get("code") || "EBB").trim();
    let name = (searchParams.get("name") || "Engineering Brain Bank").trim();
    if (name.length > 70) name = name.slice(0, 67) + "…";

    return new ImageResponse(
      h(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#080a0e",
            fontFamily: "sans-serif",
          },
        },
        h(
          "div",
          {
            style: {
              width: 540,
              height: "100%",
              display: "flex",
              position: "relative",
              background: "#0b0e14",
              alignItems: "flex-end",
              justifyContent: "center",
              overflow: "hidden",
            },
          },
          h("img", {
            src: BLUEPRINT,
            width: 540,
            height: 630,
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 540,
              height: 630,
              objectFit: "cover",
              opacity: 0.35,
            },
          }),
          h("img", {
            src: BOYE,
            width: 420,
            height: 608,
            style: {
              position: "relative",
              width: 420,
              height: 608,
              objectFit: "contain",
              objectPosition: "bottom center",
            },
          })
        ),
        h("div", {
          style: {
            width: 1,
            height: 520,
            alignSelf: "center",
            background: "rgba(120,200,220,0.35)",
            display: "flex",
          },
        }),
        h(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 56px 56px",
              position: "relative",
              overflow: "hidden",
            },
          },
          h(
            "div",
            {
              style: {
                position: "absolute",
                left: 20,
                top: 200,
                fontSize: 140,
                fontWeight: 800,
                color: "rgba(120,200,220,0.09)",
                display: "flex",
                whiteSpace: "nowrap",
              },
            },
            code
          ),
          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                position: "relative",
              },
            },
            h(
              "div",
              {
                style: {
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "#78c8dc",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  display: "flex",
                },
              },
              String(typeLabel).toUpperCase()
            ),
            h("div", {
              style: {
                width: 56,
                height: 3,
                background: "#78c8dc",
                marginBottom: 18,
                display: "flex",
              },
            }),
            h(
              "div",
              {
                style: {
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#f8fafc",
                  lineHeight: 1.05,
                  marginBottom: 14,
                  display: "flex",
                },
              },
              code
            ),
            h(
              "div",
              {
                style: {
                  fontSize: 26,
                  fontWeight: 500,
                  color: "#828c96",
                  lineHeight: 1.25,
                  maxWidth: 520,
                  display: "flex",
                },
              },
              name
            )
          ),
          h(
            "div",
            {
              style: {
                position: "absolute",
                left: 56,
                bottom: 36,
                display: "flex",
                flexDirection: "column",
              },
            },
            h("img", {
              src: WORDMARK,
              width: 220,
              height: 36,
              style: { height: 36 },
            }),
            h(
              "div",
              {
                style: {
                  marginTop: 10,
                  fontSize: 13,
                  color: "#555f69",
                  display: "flex",
                },
              },
              "Engineering Brain Bank · KB4GESA"
            )
          )
        )
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    return new Response(
      "OG render failed: " + (err && err.message ? err.message : err),
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
