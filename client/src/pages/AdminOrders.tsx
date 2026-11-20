import * as Tabs from "@radix-ui/react-tabs";
import { AdminOrderList } from "../components/AdminOrderList";
import { AdminUpdateOrder } from "../components/AdminUpdateOrder";

const operations = [
  {
    value: "read",
    label: "Read",
  },
  {
    value: "update",
    label: "Update",
  },
] as const;

export function AdminOrders() {
  return (
    <section className="mx-auto w-[calc(100%-36px)] max-w-310 py-8 md:w-[calc(100%-48px)] md:py-12 lg:w-[min(1240px,calc(100%-64px))]">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold tracking-[0.12em] text-black/45 uppercase">
          Admin
        </p>
        <h1 className="text-3xl leading-tight font-extrabold tracking-[-1.2px] md:text-[42px]">
          Orders
        </h1>
      </div>

      <Tabs.Root defaultValue="read" className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <Tabs.List
          aria-label="Order operations"
          className="grid grid-cols-2 border-b border-black/10"
        >
          {operations.map((operation) => (
            <Tabs.Trigger
              className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-black/45 transition-colors hover:text-black data-[state=active]:border-black data-[state=active]:text-black md:text-base"
              key={operation.value}
              value={operation.value}
            >
              {operation.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content className="p-6 outline-none md:p-8" value="read">
          <AdminOrderList />
        </Tabs.Content>
        <Tabs.Content className="p-6 outline-none md:p-8" value="update">
          <AdminUpdateOrder />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
