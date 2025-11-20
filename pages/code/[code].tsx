import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";
import React from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code as string | undefined;
  if (!code) return { notFound: true };

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return { notFound: true };

  return { props: { link: JSON.parse(JSON.stringify(link)) } };
};

export default function CodeStats({ link }: any) {
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Stats for {link.code}</h1>
        <a href={`/${link.code}`} target="_blank" rel="noreferrer">Open</a>
      </div>

      <div style={{ marginTop: 12 }} className="card">
        <p><strong>Target:</strong> <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a></p>
        <p><strong>Clicks:</strong> {link.clicks}</p>
        <p><strong>Last clicked:</strong> {link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "Never"}</p>
        <p><strong>Created:</strong> {new Date(link.createdAt).toLocaleString()}</p>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={async () => {
              if (!confirm("Delete this link? This is permanent.")) return;
              const res = await fetch(`/api/links/${link.code}`, { method: "DELETE" });
              if (res.status === 204) {
                alert("Deleted. Redirecting to dashboard.");
                window.location.href = "/";
              } else {
                const body = await res.json().catch(()=>({}));
                alert("Error deleting: " + (body?.error || res.status));
              }
            }}
          >
            Delete link
          </button>
        </div>
      </div>
    </div>
  );
}
