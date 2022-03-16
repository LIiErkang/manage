<template>
  <page-base :titles="['商品管理', '商品列表']">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input
          v-model="goodsParams.query"
          @keyup.enter.native="getGoodsDataList()"
          placeholder="搜索 . . ."
          @clear="getGoodsDataList()"
          clearable
        >
          <el-button
            @click="getGoodsDataList()"
            slot="append"
            icon="el-icon-search"
          ></el-button>
        </el-input>
      </el-col>

      <el-col :span="6">
        <el-button @click="appendGood()" type="primary"> 添加商品 </el-button>
      </el-col>
    </el-row>

    <el-table
      :data="goodsDataList"
      style="margin: 15px 0"
      v-loading="goodsTableLoad"
      stripe
      border
    >
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column
        prop="goods_name"
        label="商品名称"
        min-width="250"
      ></el-table-column>

      <el-table-column
        prop="goods_price"
        label="商品价格"
        width="95"
      ></el-table-column>

      <el-table-column
        prop="goods_weight"
        label="商品重量"
        width="70"
      ></el-table-column>

      <el-table-column label="创建时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.add_time | dateFormat }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="130">
        <template slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit">
          </el-button>
          <el-button
            @click="deleteGoods(scope.row)"
            size="small"
            type="danger"
            icon="el-icon-delete"
          >
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :page-sizes="[10, 15, 25, 40]"
      :page-size="goodsParams.pagesize"
      :total="total"
      :current-page="goodsParams.pagenum"
      @size-change="handleSizeChange($event)"
      @current-change="handleCurrentChange($event)"
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
  </page-base>
</template>

<script>
import { verify } from "utils";

import PageBase from "components/page/PageBase";

export default {
  components: { PageBase },

  data: () => ({
    total: 0,

    goodsTableLoad: false,

    goodsParams: {
      query: "",
      pagenum: 1,
      pagesize: 15,
    },

    goodsDataList: [],
  }),

  created() {
    this.getGoodsDataList();
  },

  methods: {
    async getGoodsDataList() {
      this.goodsTableLoad = true;

      const { data: res } = await this.$http.get("goods", {
        params: this.goodsParams,
      });

      this.goodsTableLoad = false;

      if (!verify(res, this)) return;

      this.goodsDataList = res.data.goods;
      this.total = res.data.total;
    },

    async deleteGoods(row) {
      this.$confirm("此操作无法恢复!", "确认删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",

        callback: async (action) => {
          if (action === "cancel") return this.$msg("已取消", "warning");

          const { data: res } = await this.$http.delete(
            `goods/${row.goods_id}`
          );

          if (!verify(res, this)) return;

          this.getGoodsDataList();
        },
      });
    },

    handleCurrentChange(value) {
      this.goodsParams.pagenum = value;

      this.getGoodsDataList();
    },

    handleSizeChange(value) {
      this.goodsParams.pagesize = value;

      this.getGoodsDataList();
    },

    appendGood() {
      this.$router.push("/page/goods/append");
    },
  },
};
</script>
