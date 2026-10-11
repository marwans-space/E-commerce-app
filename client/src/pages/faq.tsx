import { Link } from "react-router";
import * as Accordion from "@radix-ui/react-accordion";

export function FAQ() {
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-black/50">
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        FAQ
      </nav>

      <h1 className="mb-7 text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:mb-10 md:text-[40px]">
        FREQUENTLY ASKED QUESTIONS
      </h1>
      <Accordion.Root
        type="single"
        collapsible
        defaultValue="item-1"
        className="mx-auto max-w-205 border-y border-[#e5e5e5]"
      >
        <Accordion.Item
          value="item-1"
          className="border-b border-[#e5e5e5] last:border-b-0"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold tracking-[-0.2px] transition-colors hover:text-black/60 md:py-6 md:text-lg">
              <span>How long does delivery take?</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e5e5e5] transition-colors group-hover:border-black/30 md:size-10">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:text-base">
            <p className="m-0 max-w-180 pb-6 pr-2 sm:pr-12">
              Orders are processed within 2–5 business days and we deliver all
              over Egypt for a flat 70 EGP shipping fee. Orders aren't shipped
              on weekends or public holidays.
            </p>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item
          value="item-2"
          className="border-b border-[#e5e5e5] last:border-b-0"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold tracking-[-0.2px] transition-colors hover:text-black/60 md:py-6 md:text-lg">
              <span>Do you allow refunds?</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e5e5e5] transition-colors group-hover:border-black/30 md:size-10">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:text-base">
            <p className="m-0 max-w-180 pb-6 pr-2 sm:pr-12">
              Yes — within 14 days of receiving your order, as long as the items
              are in their original condition. For size-related returns, the
              customer covers the shipping fee.
            </p>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item
          value="item-3"
          className="border-b border-[#e5e5e5] last:border-b-0"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold tracking-[-0.2px] transition-colors hover:text-black/60 md:py-6 md:text-lg">
              <span>Do you exchange?</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e5e5e5] transition-colors group-hover:border-black/30 md:size-10">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:text-base">
            <p className="m-0 max-w-180 pb-6 pr-2 sm:pr-12">
              If a product has a manufacturing problem we exchange it and cover
              the shipping fees ourselves. Please report it within 48 hours of
              receiving your order.
            </p>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-4">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold tracking-[-0.2px] transition-colors hover:text-black/60 md:py-6 md:text-lg">
              <span>How do I know my size?</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e5e5e5] transition-colors group-hover:border-black/30 md:size-10">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:text-base">
            <p className="m-0 max-w-180 pb-6 pr-2 sm:pr-12">
              Every product page has a size guide with measurements in
              centimeters. If you're between sizes, we recommend sizing up for a
              relaxed fit.
            </p>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </main>
  );
}
