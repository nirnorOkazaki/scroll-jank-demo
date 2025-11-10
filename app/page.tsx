import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div>
      <h1>Test List</h1>
      <ul>
        <li>
          <Link href="/test-1">Test 1</Link>
        </li>
      </ul>
    </div>
  );
}
