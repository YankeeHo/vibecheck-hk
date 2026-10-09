import Link from "next/link";

export default function Home() {
  return (
    <main className="home-screen">
      <Link className="home-start-button" href="/learn">
        Start game
      </Link>
    </main>
  );
}
