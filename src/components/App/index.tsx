import React, { useEffect, useState } from "react";
import { PriceTable, PriceTableData } from "../PriceTable";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import ReactLoading from "react-loading";

import "react-loading-skeleton/dist/skeleton.css";

import { SocketController } from "../../utils/socketController";
import "./App.css";

export type SocketResponseType = "v2/ticker";
export interface TickerData {
  close: number;
  contract_type: string;
  funding_rate: string;
  greeks: any;
  high: number;
  low: number;
  mark_basis: string;
  mark_price: string;
  open: number;
  product_id: number;
  reported_oi: string;
  size: number;
  spot_price: string;
  symbol: string;
  timestamp: number;
  turnover: number;
  turnover_symbol: string;
  turnover_usd: number;
  type: SocketResponseType;
  volume: number;
}
export interface Product {
  symbol: string;
  description: string;
  underlying_asset: {
    symbol: string;
  };
  mark_price: number;
}

const MAX_BATCH_SIZE_BEFORE_FLUSH = 30;
let BATCH: Record<string, Product> = {};

function App() {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [symbols, setSymbols] = useState(new Set<string>());
  const [isTableReady, setIsTableReady] = useState<boolean>(false);

  SocketController.init("wss://testnet-socket.delta.exchange", () => {});
  /**
   * TODO: the below socket controller codes need
   * to be implemented in SocketController directly
   * and App should only call those functions.
   *
   * but due stale states we can't do it now. The ideal
   * solution is to put products and symbols in some
   * global store like Redux. Not doing it now to
   * keep the complexity simple.
   */
  SocketController.getInstance().socket.onmessage = (event: any) => {
    const json = JSON.parse(event.data);

    try {
      if ((json.event = "data")) {
        if (!isTableReady) {
          setIsTableReady(true);
        }
        const responseData: TickerData = json;
        if (responseData.symbol) {
          const product = products ? products[responseData.symbol] : undefined;
          if (
            product &&
            product.mark_price !== Number(responseData.mark_price)
          ) {
            product.mark_price = Number(responseData.mark_price);
            const updatedProducts = {
              ...BATCH,
              [responseData.symbol]: product,
            };
            /**
             * this is a slight optimization because sometimes
             * the socket pumps out too much data which makes
             * react to re-render continously causing the app
             * to slow down.
             * so onMessage we store the products in a buffer Batch
             * and once the batch hits its MAX_BATCH_SIZE_BEFORE_FLUSH,
             * we flush it to the main state products.
             *
             * There is a caveat here. this makes the data slightly
             * delayed to be displayed. Which may or maynot be accepted
             * in the requirement. But for keeping it simple, I'm assuming
             * its okay to do.
             */
            BATCH = updatedProducts;

            if (
              Object.keys(updatedProducts).length > MAX_BATCH_SIZE_BEFORE_FLUSH
            ) {
              const newProducts = {
                ...products,
                ...updatedProducts,
              };
              setProducts(newProducts);
              BATCH = {};
            }
          }
        }
      }
    } catch (err) {
      console.error("Parsing socket message failed.");
    }
  };

  const getProducts = async (): Promise<Record<string, Product>> => {
    const res = await fetch("https://api.delta.exchange/v2/products").then(
      (response) => response.json()
    );
    const results: Product[] = res["result"];
    const productBySymbols: Record<string, Product> = {};
    for (let result of results) {
      const symbol: string = result.symbol;
      productBySymbols[symbol] = result;
    }

    return productBySymbols;
  };

  const getTableData = () => {
    const tableData: PriceTableData[] = [];

    symbols.forEach((symbol) => {
      const product: Product | undefined = products && products[symbol];
      tableData.push({
        symbol,
        description: product?.description,
        asset_symbol: product?.underlying_asset?.symbol,
        mark_price: product?.mark_price ? product.mark_price : -1,
      });
    });
    return tableData;
  };

  const contactSocket = () => {
    const symbolArray = [];
    /**
     * this is some Typescript bug which
     * doesn't let me iterate a Set using for..of,
     * although MDN says its legal in JS
     * to do this. So ignoring the warning.
     */
    //@ts-ignore
    for (let item of symbols) {
      symbolArray.push(item);
    }
    const channels = [
      {
        name: "v2/ticker",
        symbols: symbolArray,
      },
    ];

    const messageString = {
      type: "subscribe",
      payload: {
        channels,
      },
    };

    if (
      SocketController.getInstance().socket.readyState ===
        SocketController.getInstance().socket.OPEN &&
      symbols?.size > 0
    ) {
      SocketController.getInstance().socket.send(JSON.stringify(messageString));
    } else {
      console.info("Socket is not ready! I will try again in some time");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const products: Record<string, Product> = await getProducts();
      setProducts(products);
      const symbols = new Set<string>();
      const keys = Object.keys(products);
      for (let key of keys) {
        symbols.add(key);
      }
      setSymbols(symbols);
    };
    getData();
  }, []);

  useEffect(() => {
    console.log("symbol", symbols);
    contactSocket();
  }, [symbols]);
  return (
    <div className="App">
      <h1>Delta Stack Exchange</h1>
      <div className="container">
        {isTableReady ? (
          <PriceTable data={getTableData()}></PriceTable>
        ) : (
          <ReactLoading
            type={"spin"}
            color={"#F6F1D1"}
            height={"2%"}
            width={"2%"}
          />
        )}
      </div>
    </div>
  );
}

export default App;
