export function Contact() {
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:text-[40px]">
        CONTACT US
      </h1>
      <p className="mt-3 text-sm text-black/60 md:text-base">
        Email: <a href="mailto:example@email.com">example@email.com</a>
      </p>
      <p className="mt-3 text-sm text-black/60 md:text-base">
        Customer service: <a href="call:+201122223333">+201122223333</a>
      </p>
    </main>
  );
}
