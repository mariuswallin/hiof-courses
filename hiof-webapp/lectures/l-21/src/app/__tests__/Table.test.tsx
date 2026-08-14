// /app/components/table/__tests__/Table.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";

import { describe, it, expect, vi } from "vitest";
import { Table } from "../components/table/Table";

interface TestData {
  id: string;
  name: string;
  value: number;
  active: boolean;
}

const mockData: TestData[] = [
  { id: "1", name: "Item A", value: 100, active: true },
  { id: "2", name: "Item B", value: 200, active: false },
  { id: "3", name: "Item C", value: 50, active: true },
];

describe("Table", () => {
  it("renders data with basic configuration", () => {
    const config = {
      columns: [
        { key: "name" as keyof TestData, header: "Name", sortable: true },
        { key: "value" as keyof TestData, header: "Value", sortable: true },
      ],
    };

    render(<Table data={mockData} config={config} />);

    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("handles sorting correctly", () => {
    const config = {
      columns: [
        { key: "value" as keyof TestData, header: "Value", sortable: true },
      ],
    };

    render(<Table data={mockData} config={config} />);

    const sortButton = screen.getByText("Value");
    fireEvent.click(sortButton);

    const rows = screen.getAllByRole("row");
    // First row is header, second should be lowest value
    expect(rows[1]).toHaveTextContent("50");
  });

  it("renders custom content with render function", () => {
    const config = {
      columns: [
        {
          key: "active" as keyof TestData,
          header: "Status",
          render: (value: boolean) => (value ? "Active" : "Inactive"),
        },
      ],
    };

    render(<Table data={mockData} config={config} />);

    expect(screen.getAllByText("Active")).toHaveLength(2);
    expect(screen.getAllByText("Inactive")).toHaveLength(1);
  });

  it("handles empty data gracefully", () => {
    const config = {
      columns: [{ key: "name" as keyof TestData, header: "Name" }],
    };

    render(<Table data={[]} config={config} emptyMessage="Nothing here" />);

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("executes actions correctly", () => {
    const mockAction = vi.fn();
    const config = {
      columns: [{ key: "name" as keyof TestData, header: "Name" }],
      actions: [
        {
          key: "test",
          label: "Test Action",
          onClick: mockAction,
        },
      ],
    };

    render(<Table data={mockData} config={config} />);

    const actionButton = screen.getAllByText("Test Action")[0];
    fireEvent.click(actionButton);

    expect(mockAction).toHaveBeenCalledWith(mockData[0]);
  });
});
