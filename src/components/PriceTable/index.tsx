import React, { ReactElement } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import ReactLoading from "react-loading";
import "./price-table.css";

interface Props {
  data: PriceTableData[];
}

export interface PriceTableData {
  symbol: string;
  description: string;
  asset_symbol: string;
  mark_price: number;
}
export function PriceTable({ data }: Props): ReactElement {
  const getHeader = () => {
    return (
      <div className="tbl-header">
        <table cellPadding="0" cellSpacing="0">
          <thead>
            <tr>
              <th className="sticky-col">Symbol</th>
              <th>Description</th>
              <th>Asset Symbol</th>
              <th>Mark Price</th>
            </tr>
          </thead>
        </table>
      </div>
    );
  };
  const getTable = () => {
    const sortedData = data.sort(
      (a: PriceTableData, b: PriceTableData) =>
        // a.asset_symbol.localeCompare(b.asset_symbol)
        b.mark_price - a.mark_price
    );
    const rows = sortedData.map((datum: PriceTableData) => {
      const { symbol, description, asset_symbol, mark_price } = datum;
      return (
        <tr key={symbol}>
          <td className="sticky-col">{symbol}</td>
          <td>{description}</td>
          <td>{asset_symbol}</td>
          <td>
            {/**
             * initially mark_price is set to -1 so that we can show loading
             * screen. the loading is shown until a value is sent from the
             * socket. 0 is a valid value if the socket sends it.
             */}
            {mark_price >= 0 ? (
              mark_price.toFixed(2)
            ) : (
              <ReactLoading
                type={"bubbles"}
                color={"#F6F1D1"}
                height={"20%"}
                width={"10%"}
              />
            )}
          </td>
        </tr>
      );
    });

    return (
      <section>
        {getHeader()}
        <div className="tbl-content">
          <table cellPadding="0" cellSpacing="0">
            <tbody>{rows}</tbody>
          </table>
        </div>
      </section>
    );
  };
  return <div>{data && data.length > 0 ? getTable() : <p>Loading....</p>}</div>;
}
