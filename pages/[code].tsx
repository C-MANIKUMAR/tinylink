
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code as string | undefined;
  if (!code) {
    return { notFound: true };
  }

  
  const { prisma } = await import("../lib/prisma");

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return { notFound: true };

  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClicked: new Date() }
  });

  return {
    redirect: {
      destination: link.url,
      permanent: false,
    },
  };
};

export default function RedirectPage() {
  return <p>Redirecting…</p>;
}
