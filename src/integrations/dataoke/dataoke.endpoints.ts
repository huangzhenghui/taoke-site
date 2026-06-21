export type DataokeEndpointConfig = {
  name: string;
  path: string;
  defaultVersion: string;
};

export const dataokeEndpoints = {
  goodsList: {
    defaultVersion: "v1.2.4",
    name: "goodsList",
    path: "/api/goods/get-goods-list",
  },
  privilegeLink: {
    defaultVersion: "v1.3.1",
    name: "privilegeLink",
    path: "/api/tb-service/get-privilege-link",
  },
  searchGoods: {
    defaultVersion: "v2.1.2",
    name: "searchGoods",
    path: "/api/goods/get-dtk-search-goods",
  },
  superCategory: {
    defaultVersion: "v1.1.0",
    name: "superCategory",
    path: "/api/category/get-super-category",
  },
} satisfies Record<string, DataokeEndpointConfig>;
