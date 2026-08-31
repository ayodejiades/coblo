import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "coblo — Grade your street's heat";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F5F2E8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px",
          border: "12px solid #000000",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              background: "#000000",
              color: "#CCFF00",
              padding: "10px 24px",
              fontSize: "36px",
              fontWeight: "900",
              letterSpacing: "2px",
            }}
          >
            COBLO
          </div>

          <div
            style={{
              background: "#FF2E93",
              color: "#000000",
              padding: "8px 20px",
              fontSize: "20px",
              fontWeight: "bold",
              border: "4px solid #000000",
            }}
          >
            EARTH FORWARD 2026
          </div>
        </div>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: "900",
              lineHeight: "1.0",
              color: "#000000",
              textTransform: "uppercase",
            }}
          >
            GRADE YOUR STREET&apos;S HEAT.
            <br />
            GET A PLAN TO COOL IT.
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "#333333",
              fontWeight: "600",
            }}
          >
            On-device SegFormer AI segmentation · Instant report cards · Live canopy simulator
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "6px solid #000000",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "24px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#000000",
            }}
          >
            <span>0 BYTES UPLOADED</span>
            <span>·</span>
            <span>ON-DEVICE WEBGPU</span>
            <span>·</span>
            <span>ADVOCACY REPORT CARDS</span>
          </div>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#000000",
            }}
          >
            coblo.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
