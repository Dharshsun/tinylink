import pool from "../lib/db.cjs";

export async function getServerSideProps({ params, res }) {
  const { code } = params;

  try {
    // Look up the original URL
    const { rows } = await pool.query(
      `SELECT url, clicks FROM links WHERE code = $1`,
      [code]
    );

    if (rows.length === 0) {
      return {
        notFound: true,
      };
    }

    const originalUrl = rows[0].url;

    // Increment clicks
    await pool.query(`UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1`, [code]);

    // Redirect to the original URL
    res.writeHead(302, { Location: originalUrl });
    res.end();

    return { props: {} }; // Next.js requires returning props
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}

export default function RedirectPage() {
  return <p>Redirecting...</p>;
}
