export async function getServerSideProps({ params }) {
  const { code } = params;

  // IMPORT INSIDE SERVER ONLY
  const { default: pool } = await import("../lib/db.cjs");

  const result = await pool.query(
    "SELECT * FROM links WHERE code = $1 AND deleted = false",
    [code]
  );

  if (result.rows.length === 0) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const link = result.rows[0];

  await pool.query(
    `UPDATE links 
     SET total_clicks = total_clicks + 1,
         last_clicked = now()
     WHERE id = $1`,
    [link.id]
  );

  return {
    redirect: {
      destination: link.target,
      permanent: false,
    },
  };
}

export default function Redirect() {
  return null;
}
