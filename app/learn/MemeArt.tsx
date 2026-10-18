export default function MemeArt({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 150"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="120"
        cy="135"
        rx="72"
        ry="7"
        fill="currentColor"
        opacity=".12"
      />
      <g
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {symbol === "neon" && (
          <>
            <path d="M54 31h132v81H54zM64 21v10m112-10v10" />
            <path d="M80 55v32m0-16h26m0-16v32m28-32v32m27-32-27 16 28 16" />
            <path d="M41 48l-12-8m169 40 14 4" />
          </>
        )}
        {symbol === "ferry" && (
          <>
            <path d="m44 91 15 29h119l20-29zm28-38h99v38H72zm16-23h60v23H88zm29-14v14M39 130q18-13 36 0t36 0 36 0 36 0" />
            <path d="M86 67h12m16 0h12m16 0h12" />
          </>
        )}
        {symbol === "bowl" && (
          <>
            <path d="M57 71h126q-4 53-63 53T57 71Zm36 57h54M78 44q-13-9 0-18m36 18q-13-9 0-18m36 18q-13-9 0-18m5 38 41-40m-31 48 44-35" />
            <path d="M94 88v5m51-5v5m-32 9q10 8 19-1" />
          </>
        )}
        {symbol === "needle" && (
          <>
            <path d="m54 115 123-86q12-6 13 5t-9 17Z" />
            <path d="m164 44 17-11m6 12q33 16 10 42t-29 12" />
            <circle cx="69" cy="54" r="22" />
            <path d="m59 54 7 7 14-17" />
          </>
        )}
        {symbol === "candy" && (
          <>
            <path d="m78 53 34 10 20 34-11 27-34-10-20-34Z" />
            <path d="m79 54-22-17-9 29 19 14m65 15 24 13-9 29-24-13m-47-49 37 26m-27-40 34 24" />
            <path d="M150 80V45h38V26l25 19v67h-51m2-48h10m21 8h6" />
          </>
        )}
        {symbol === "phone" && (
          <>
            <rect x="82" y="17" width="77" height="116" rx="14" />
            <path d="M108 29h25m-25 91h25" />
            <path d="M112 63a20 20 0 0 0 24 25 22 22 0 1 1-24-25Z" />
            <path d="M42 39h29m-36 16h36m106 43h28m-27 15h20" />
          </>
        )}
        {symbol === "frog" && (
          <>
            <ellipse cx="123" cy="92" rx="62" ry="38" />
            <circle cx="88" cy="54" r="23" />
            <circle cx="156" cy="54" r="23" />
            <path d="M89 53v6m66-6v6m-61 36q29 22 57 0m-73 14-20 15m109-15 20 15" />
            <path d="m190 20 13 19-25 3Z" />
          </>
        )}
        {symbol === "duck" && (
          <>
            <path d="M52 97q2 31 58 31t67-28q13-8 7-34t-33-19q-26 3-21 36l-44 2-32-20Z" />
            <path d="m184 74 24 8-23 11m-71 8q-15 17-33 1m76-34v2M40 140h158" />
            <path d="M58 25q-16 22 0 23t0-23Zm46-5q-16 22 0 23t0-23Z" />
          </>
        )}
        {symbol === "rain" && (
          <>
            <path d="M53 67a68 68 0 0 1 136 0q-17-14-34 0-17-14-34 0-17-14-34 0-17-14-34 0Zm68 1v48q0 19-19 11m19-114v-4M46 87l-8 12m29 5-8 12m136-29-8 12m-16 5-8 12" />
          </>
        )}
        {symbol === "heart" && (
          <>
            <path d="M119 115 62 65C26 26 94 5 119 43c27-39 92-16 57 22Z" />
            <path d="m52 117 31-2 24 15h51l33-19M31 102l18 30" />
          </>
        )}
        <path
          d="M211 56v12m-6-6h12M26 90v8m-4-4h8"
          strokeWidth="2"
          opacity=".6"
        />
      </g>
    </svg>
  );
}
