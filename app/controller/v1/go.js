'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class GoController extends BaseController {


  /**
   * GO列表
   */
  async index() {
    const { ctx } = this;
    const go_no = ctx.request.query.go_no;
    const season = ctx.request.query.season;
    const date_start = ctx.request.query.date_start ? parseInt(ctx.request.query.date_start) : 0;
    const date_end = ctx.request.query.date_end ? parseInt(ctx.request.query.date_end) : 0;
    const userData = await this.getUserData();
    const username = userData.username;


    const pagesize = ctx.request.query.pagesize ? ctx.request.query.pagesize : 20;
    const page = ctx.request.query.page ? ctx.request.query.page : 1;
    // 筛选
    const Op = ctx.model.Op;
    const where = {
      Is_Active: 1,
      [Op.or]: [
        { Creater: username },
        { Updater: username },
      ],
    };
    if (go_no) where.GO_NO = { [Op.like]: '%' + go_no + '%' };
    if (season) where.Season = { [Op.like]: '%' + season + '%' };
    if (date_start && date_end) {
      where.Create_Time = {
        // [Op.gte]: new Date(date_start),
        // [Op.lt]: moment(date_end).add(1, 'd'),
        [Op.gte]: date_start,
        [Op.lt]: date_end + (1000 * 60 * 60 * 24),
      };
    }

    // 排序
    const order = [
      [ 'Create_Time', 'DESC' ],
      // ['Serial_NO', 'DESC'],
    ];
    // 分页
    const limit = pagesize;
    const total = await ctx.model.GoTitle.count({ where }); // 计算总数
    const pagination = this.pagination({ total, page, pagesize });
    const offset = pagination.offset;
    if (total === 0) {
      return ctx.jsonReturn(20002, { list: [], pagination }, 'No data');
    }
    // 查询
    const res = await ctx.model.GoTitle.findAll({ where, order, offset, limit });

    // // console.log(res)
    if (res.length === 0) {
      return ctx.jsonReturn(20002, { list: [], pagination }, 'No data');
    }

    const list = res.map(item => {
      const newItem = Object.assign(item.dataValues);
      newItem.Create_Time = moment(item.Create_Time).valueOf();
      newItem.Update_Time = moment(item.Update_Time).valueOf();
      return newItem;
    });

    const returnData = {
      list,
      pagination,
    };
    return ctx.jsonReturn(0, returnData, 'Successful');
  }


  /**
   * 添加GO
   */
  async save() {
    const { ctx } = this;
    const Op = ctx.model.Op;

    const data = ctx.request.body.data;
    const customer_code = ctx.request.body.customer_code;
    const brand = ctx.request.body.brand;

    const errorStyleNoList = [];
    const errorMsgList = {};
    let hasError = 0;
    let errMsg = '';

    const userData = await this.getUserData();
    const username = userData.username;

    // console.log(data)
    // console.log(typeof(data))
    // console.log(customer_code)
    // console.log(brand)

    if (typeof (data) !== 'object') {
      return ctx.jsonReturn(992, '请上传数据');
    }
    if (!customer_code) {
      return ctx.jsonReturn(992, '请选择 Customer code');
    }
    if (!brand) {
      return ctx.jsonReturn(992, '请选择 Brand');
    }

    let sizeFields = [ 'xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl' ];
    const sizeFields_res = await ctx.service.masterSize.getSizesByCustomerCode(customer_code);
    if (sizeFields_res && sizeFields_res.length > 0) {
      sizeFields = sizeFields_res.map(el => {
        return el.toLowerCase();
      });
    } else {
      return ctx.jsonReturn(-1, 'customer_code:' + customer_code + '查不到尺寸列表');
    }

    for (const i in data) {
      let otherdRowIndex = -1;
      otherdRowIndex = ctx.service.go.checkMustSame(data[i], data, [ 'style_no', 'gmt_fty' ]);
      if (otherdRowIndex !== -1) {
        hasError = 1;
        errMsg = '相同Style_No, 所有的GMT_FTY也要相同';
        break;
      }

      otherdRowIndex = ctx.service.go.checkMustSame(data[i], data, [ 'style_no', 'fds_no' ]);
      if (otherdRowIndex !== -1) {
        hasError = 1;
        errMsg = '相同Style_No, 所有的FDS_No也要相同';
        break;
      }
    }
    if (hasError) {
      return ctx.jsonReturn(-1, errMsg);
    }


    // 查找所有style_no
    const style_no_kv_list = _.groupBy(data, 'style_no');
    const style_no_array = [];

    const GoTitleData_list_base = {};

    // 查出基础数据和旧数据
    for (const Style_No in style_no_kv_list) {
      // const dataList = style_no_kv_list[Style_No];
      // 查出基础数据
      const GMT_FTY = style_no_kv_list[Style_No][0].gmt_fty;
      const FDS_No = style_no_kv_list[Style_No][0].fds_no;
      const Season = style_no_kv_list[Style_No][0].season;
      let OutSource = style_no_kv_list[Style_No][0].outsource;
      if (![ 'y', 'n' ].includes(OutSource.toLowerCase())) {
        hasError = 1;
        errMsg = 'OutSource 必须为 Y 或 N';
        break;
      }
      OutSource = OutSource === 'y' ? 1 : 0;
      // 查找旧数据
      const oldTitleItemData = await ctx.model.GoTitle.findOne({ where: { Style_No }, order: [[ 'Rev_NO', 'DESC' ]] });
      console.log('oldTitleItemData');
      console.log(oldTitleItemData);
      let GO_NO = '';
      if (oldTitleItemData) {
        GO_NO = GMT_FTY === oldTitleItemData.Factory ? oldTitleItemData.GO_NO : await ctx.service.go.updateGoNo(GMT_FTY, oldTitleItemData.GO_NO);
      }
      // console.log(oldTitleItemData.dataValues)
      GoTitleData_list_base[Style_No] = {
        GMT_FTY, FDS_No, Season, OutSource, GO_NO,
        baseGoNo: await ctx.service.go.buildBaseGoNo(GMT_FTY),
        oldData: oldTitleItemData,
      };
    }
    if (hasError) {
      return ctx.jsonReturn(-1, errMsg);
    }

    const transaction = await this.ctx.model.transaction(); // 启用事务
    try {
      let Serial_NO_x = await ctx.model.GoTitle.buildSerialNo();


      for (const Style_No in style_no_kv_list) {
        style_no_array.push(Style_No);
        const GMT_FTY = GoTitleData_list_base[Style_No].GMT_FTY;
        const OutSource = GoTitleData_list_base[Style_No].OutSource;
        const FDS_No = GoTitleData_list_base[Style_No].FDS_No;
        const Season = GoTitleData_list_base[Style_No].Season;
        const baseGoNo = GoTitleData_list_base[Style_No].baseGoNo;
        const data_goTitle_old = GoTitleData_list_base[Style_No].oldData; // 查出原库是否存在这条数据

        let Serial_NO = '';
        let GO_NO = '';
        let Rev_NO = 0;


        /** ********* GO_title ******/
        const dataList = style_no_kv_list[Style_No];
        // 1) 整理处理go_title的数据

        if (data_goTitle_old) {
          // 取得 流水号
          Serial_NO = parseInt(data_goTitle_old.Serial_NO);
          // 取得或生成 GO_NO
          GO_NO = GoTitleData_list_base[Style_No].GO_NO;
          if (_.trim(GO_NO) === '') {
            GO_NO = baseGoNo + ctx.helper.prefixO(Serial_NO, 5);
          }
          Rev_NO = parseInt(data_goTitle_old.Rev_NO) + 1;


        } else {
          // 取得 流水号
          Serial_NO = Serial_NO_x;
          Serial_NO_x = Serial_NO_x + 1;
          if (!Serial_NO) {
            errorMsgList[Style_No].all = '流水号创建失败';
            errorStyleNoList.push(Style_No);
            hasError = 1;
            throw new Error(errorMsgList[Style_No].all);
          }
          // 取得或生成 GO_NO
          GO_NO = baseGoNo + ctx.helper.prefixO(Serial_NO, 5);

        }
        const GO_ID = GO_NO + '-' + Rev_NO;

        const data_goTitle_i = {
          Serial_NO,
          GO_NO,
          Rev_NO,
          Customer_Code: customer_code,
          Season,
          Style_No,
          FDS_No,
          GO_ID,
          Brand: brand,
          Factory: GMT_FTY,
          Is_Active: 1,
          OutSource,
        };
        if (data_goTitle_old) {
          data_goTitle_i.Creater = data_goTitle_old.Creater;
          data_goTitle_i.Create_Time = data_goTitle_old.Create_Time;
          data_goTitle_i.Updater = username;
          data_goTitle_i.Update_Time = new Date();
        } else {
          data_goTitle_i.Creater = username;
          data_goTitle_i.Create_Time = new Date();
        }
        // data_goTitle_old.push(data_goTitle_i);
        console.log(data_goTitle_i);

        const addGoTitleRes = await ctx.model.GoTitle.create(data_goTitle_i, { transaction });
        if (data_goTitle_old) { // 更改旧版本的is_active状态为  0
          await ctx.model.GoTitle.update({ Is_Active: 0 }, { where: {
            Style_No,
            ID: { [Op.ne]: addGoTitleRes.ID },
          }, transaction });
        }

        /** *  ***/

        let goLotInfo_LotNo = 1;
        const JO_NO_List = {};
        const goLotInfo_lst_batchData = []; // 2)
        const goLotInfo_hasPush = [];
        const goColorQty_lst_batchData = []; // 3)
        const goColorQty_hasPush = [];


        for (const i in dataList) {
          const item = dataList[i];
          const BPO_Date = item.bpo_date;
          const BPO_NO = item.bpo_no;
          const Warehouse = item.warehouse;


          /** ********* GO_Lot_Info ******/
          const goLotInfo_pkey = 'DATE_' + BPO_Date + '_NO_' + BPO_NO;
          let JO_NO = '';
          if (typeof (JO_NO_List[goLotInfo_pkey]) !== 'undefined') {
            JO_NO = JO_NO_List[goLotInfo_pkey];
          } else {
            JO_NO = await ctx.service.go.buildJoNo(GO_NO, Warehouse, goLotInfo_LotNo);
            JO_NO_List[goLotInfo_pkey] = JO_NO;
          }
          if (!JO_NO) {
            errorStyleNoList.push(Style_No);
            throw new Error('"' + Warehouse + '": 创建JO_NO失败。 ');
          }

          if (!goLotInfo_hasPush.includes(goLotInfo_pkey)) {
            const newItem_goLotInfo = {
              GO_ID,
              LOT_NO: goLotInfo_LotNo,
              JO_NO,
              BPO_NO,
              BPO_Date,
              PPC_Date: BPO_Date,
              Warehouse,
            };
            goLotInfo_lst_batchData.push(newItem_goLotInfo);
            goLotInfo_hasPush.push(goLotInfo_pkey);
            goLotInfo_LotNo += 1;
          }


          /** ********* GO_Color_Qty ******/
          for (const si in sizeFields) {
            const Size = sizeFields[si];
            const goColorQty_pkey = 'JO_NO_' + JO_NO + '_SIZE_' + Size + 'COMBO' + item.combo;
            if (!goColorQty_hasPush.includes(goColorQty_pkey) && typeof (item[Size]) !== 'undefined' && item[Size] > 0) {
              const newItem_goColorQty = {
                JO_NO,
                Color_Combo: item.combo,
                Color_Code: item.combo.substring(0, 2),
                Size: Size.toUpperCase(),
                Qty: item[Size],
                GO_ID,
              };
              goColorQty_lst_batchData.push(newItem_goColorQty);
              goColorQty_hasPush.push(goColorQty_pkey);

            }
          }

        }
        console.log('goLotInfo_lst_batchData');
        console.log(goLotInfo_lst_batchData);
        console.log('goColorQty_lst_batchData');
        console.log(goColorQty_lst_batchData);
        await ctx.model.GoLotInfo.bulkCreate(goLotInfo_lst_batchData, { transaction });
        await ctx.model.GoColorQty.bulkCreate(goColorQty_lst_batchData, { transaction });

      }

      await transaction.commit();
    } catch (error) {
      console.log(error.message);
      await transaction.rollback();
      return ctx.jsonReturn(-1, { errorStyleNoList }, error.message);
    }

    const returnData = {
      errorStyleNoList,
    };
    return ctx.jsonReturn(0, returnData, 'Successfully');

  }


  /**
   * 编辑
   */
  async edit() {
    const { ctx } = this;
    const Op = ctx.model.Op;

    const Season = ctx.request.body.season;
    const OutSource = parseInt(ctx.request.body.outsource);
    const GMT_FTY = ctx.request.body.gmt_fty;
    const GO_NO = ctx.request.body.go_no;
    const Style_No = ctx.request.body.style_no;
    const FDS_No = ctx.request.body.fds_no;
    const dataList = ctx.request.body.data;

    const userData = await this.getUserData();
    const username = userData.username;

    // const errorMsg = '';
    // const hasError = 0;
    const errorData = {};
    if (!GO_NO) {
      return ctx.jsonReturn(-1, { errorData }, '请选择要修改的数据');
    }

    if (![ 1, 0 ].includes(OutSource)) {
      return ctx.jsonReturn(-1, 'OutSource 必须为 Y 或 N');
    }

    // 查出旧数据
    const goData = await ctx.service.go.getDetail(GO_NO);
    if (!goData) {
      return ctx.jsonReturn(20002, '数据不存在或已被删除');
    }
    const Customer_Code = goData.goTitle.Customer_Code;
    console.log(Customer_Code);
    let sizeFields = [ 'xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl' ];
    const sizeFields_res = await ctx.service.masterSize.getSizesByCustomerCode(Customer_Code);
    if (sizeFields_res && sizeFields_res.length > 0) {
      sizeFields = sizeFields_res.map(el => {
        return el.toLowerCase();
      });
    } else {
      return ctx.jsonReturn(-1, 'customer_code:' + Customer_Code + '查不到尺寸列表');
    }


    const goTitleData_old = goData.goTitle;
    const GO_NO_new = GMT_FTY === goTitleData_old.Factory ? GO_NO : await ctx.service.go.updateGoNo(GMT_FTY, GO_NO);
    const Rev_NO_new = parseInt(goTitleData_old.Rev_NO) + 1;
    const GO_ID_new = GO_NO_new + '-' + Rev_NO_new;

    const transaction = await this.ctx.model.transaction(); // 启用事务
    try {
      /** ********* GO_title ******/
      // 1) GO_title

      const go_title_data_item = Object.assign({}, goTitleData_old.dataValues);
      go_title_data_item.Rev_NO = Rev_NO_new;
      go_title_data_item.GO_ID = GO_ID_new;
      go_title_data_item.GO_NO = GO_NO_new;
      go_title_data_item.OutSource = OutSource;
      go_title_data_item.Season = Season;
      go_title_data_item.Factory = GMT_FTY;
      go_title_data_item.FDS_No = FDS_No;
      go_title_data_item.Is_Active = 1;
      go_title_data_item.Last_Updater = username;
      go_title_data_item.Update_Time = new Date();
      delete (go_title_data_item.ID);

      console.log('go_title_data_item');
      console.log(go_title_data_item);
      const addGoTitleRes = await ctx.model.GoTitle.create(go_title_data_item, { transaction });
      await ctx.model.GoTitle.update({ Is_Active: 0 }, { where: {
        Style_No,
        ID: { [Op.ne]: addGoTitleRes.ID },
      }, transaction });


      let goLotInfo_LotNo = 1;
      const JO_NO_List = {};
      const goLotInfo_lst_batchData = []; // 2)
      const goLotInfo_hasPush = [];
      const goColorQty_lst_batchData = []; // 3)
      const goColorQty_hasPush = [];

      for (const i in dataList) {
        const item = dataList[i];
        const BPO_Date = item.bpo_date;
        const BPO_NO = item.bpo_no;
        const Warehouse = item.warehouse;

        errorData[i] = {};
        /** ********* GO_Lot_Info ******/
        const goLotInfo_pkey = 'DATE_' + BPO_Date + '_NO_' + BPO_NO;
        let JO_NO = '';
        if (typeof (JO_NO_List[goLotInfo_pkey]) !== 'undefined') {
          JO_NO = JO_NO_List[goLotInfo_pkey];
        } else {
          JO_NO = await ctx.service.go.buildJoNo(GO_NO_new, Warehouse, goLotInfo_LotNo);
          JO_NO_List[goLotInfo_pkey] = JO_NO;
        }
        if (!JO_NO) {
          const errorMsg = '"' + Warehouse + '": 创建JO_NO失败。 ';
          errorData.all = { warehouse: errorMsg };
          throw new Error(errorMsg);
        }

        if (!goLotInfo_hasPush.includes(goLotInfo_pkey)) {
          const newItem_goLotInfo = {
            GO_ID: GO_ID_new,
            LOT_NO: goLotInfo_LotNo,
            JO_NO,
            BPO_NO,
            BPO_Date,
            PPC_Date: BPO_Date,
            Warehouse,
          };
          goLotInfo_lst_batchData.push(newItem_goLotInfo);
          goLotInfo_hasPush.push(goLotInfo_pkey);
          goLotInfo_LotNo += 1;
        }


        /** ********* GO_Color_Qty ******/
        for (const si in sizeFields) {
          const Size = sizeFields[si];

          const goColorQty_pkey = 'JO_NO_' + JO_NO + '_SIZE_' + Size + 'COMBO' + item.combo;
          if (!goColorQty_hasPush.includes(goColorQty_pkey) && typeof (item.sizes[Size]) !== 'undefined' && item.sizes[Size] > 0) {
            const newItem_goColorQty = {
              JO_NO,
              Color_Combo: item.combo,
              Color_Code: item.combo.substring(0, 2),
              Size: Size.toUpperCase(),
              Qty: item.sizes[Size],
              GO_ID: GO_ID_new,
            };
            goColorQty_lst_batchData.push(newItem_goColorQty);
            goColorQty_hasPush.push(goColorQty_pkey);

          }
        }

      }

      console.log('goLotInfo_lst_batchData');
      console.log(goLotInfo_lst_batchData);
      console.log('goColorQty_lst_batchData');
      console.log(goColorQty_lst_batchData);
      await ctx.model.GoLotInfo.bulkCreate(goLotInfo_lst_batchData, { transaction });
      await ctx.model.GoColorQty.bulkCreate(goColorQty_lst_batchData, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      return ctx.jsonReturn(-1, errorData, error.message);
    }
    return ctx.jsonReturn(0, 'Successfully');


  }


  /**
   * 批量编辑
   */
  async batchEdit() {
    const { ctx } = this;
    const Op = ctx.model.Op;

    const season = ctx.request.body.season;
    let outsource = ctx.request.body.outsource;
    const gmt_fty = ctx.request.body.gmt_fty;
    const go_nos = ctx.request.body.go_nos;


    const userData = await this.getUserData();
    const username = userData.username;


    if (typeof (go_nos) !== 'object' || go_nos.length < 1) {
      return ctx.jsonReturn(-1, '请选择要修改的数据');
    }
    if (![ 'y', 'n' ].includes(outsource.toLowerCase())) {
      return ctx.jsonReturn(-1, 'OutSource 必须为 Y 或 N');
    }
    outsource = outsource === 'y' ? 1 : 0;

    let hasError = 0;
    let errorMsg = '';
    const goDataList = {};
    const goNewGoNoList = {};

    for (const i in go_nos) {
      const GO_NO = go_nos[i];
      // 查出旧数据
      const goData = await ctx.service.go.getDetail(GO_NO);

      if (!goData) {
        hasError = 1;
        errorMsg = 'GO_NO：' + GO_NO + '对应的GO不存在，请重新选择后再试';
        break;
      }
      goDataList[GO_NO] = goData;
      // 如果转厂，生成新的GO_NEW
      const GO_NO_new = gmt_fty === goData.Factory ? GO_NO : await ctx.service.go.updateGoNo(gmt_fty, GO_NO);
      goNewGoNoList[GO_NO] = GO_NO_new;
    }
    if (hasError) {
      return ctx.jsonReturn(-1, errorMsg);
    }
    // console.log('goDataList');
    // console.log(goDataList);
    // console.log('goNewGoNoList');
    // console.log(goNewGoNoList);
    // return false;

    const transaction = await this.ctx.model.transaction(); // 启用事务
    try {
      for (const GO_NO in goDataList) {
        const goData = goDataList[GO_NO];
        const goTitleData_old = goData.goTitle;
        const Style_No = goTitleData_old.Style_No;
        // const GO_ID_old = goTitleData_old.GO_ID;
        // const GO_NO_old = goTitleData_old.GO_NO;

        const Rev_NO_new = parseInt(goTitleData_old.Rev_NO) + 1;
        const GO_NO_new = goNewGoNoList[GO_NO];
        const GO_ID_new = GO_NO_new + '-' + Rev_NO_new;


        /** ********* GO_title ******/
        // 1) GO_title
        const go_title_data_item = Object.assign({}, goTitleData_old.dataValues);
        go_title_data_item.Rev_NO = Rev_NO_new;
        go_title_data_item.GO_ID = GO_ID_new;
        go_title_data_item.GO_NO = GO_NO_new;
        go_title_data_item.OutSource = outsource;
        go_title_data_item.Season = season;
        go_title_data_item.Factory = gmt_fty;
        go_title_data_item.Is_Active = 1;
        go_title_data_item.Last_Updater = username;
        go_title_data_item.Update_Time = new Date();
        delete (go_title_data_item.ID);

        console.log('go_title_data_item');
        console.log(go_title_data_item);
        const addGoTitleRes = await ctx.model.GoTitle.create(go_title_data_item, { transaction });
        await ctx.model.GoTitle.update({ Is_Active: 0 }, { where: {
          Style_No,
          ID: { [Op.ne]: addGoTitleRes.ID },
        }, transaction });

        const JO_NO_newList = {};
        /** ********* GO_Lot_Info ******/
        const goLotInfo_lst = goData.goLotInfo;
        if (goLotInfo_lst && goLotInfo_lst.length > 0) {
          for (const i in goLotInfo_lst) {
            const rItem = goLotInfo_lst[i];
            JO_NO_newList[rItem.JO_NO] = await ctx.service.go.buildJoNo(GO_NO_new, rItem.Warehouse, rItem.LOT_NO);
          }
          console.log('JO_NO_newList');
          console.log(JO_NO_newList);
          const goLotInfot_lst_batchData = goLotInfo_lst.map(rItem => {
            const newItem = Object.assign({}, rItem.dataValues);
            const JO_NO = JO_NO_newList[rItem.JO_NO];
            newItem.GO_ID = GO_ID_new;
            newItem.JO_NO = JO_NO;
            delete (newItem.ID);
            return newItem;
          });
          console.log('goLotInfot_lst_batchData');
          console.log(goLotInfot_lst_batchData);
          await ctx.model.GoLotInfo.bulkCreate(goLotInfot_lst_batchData, { transaction });
        }

        /** ********* GO_Color_Qty ******/
        const goColorQty_lst = goData.goColorQty;
        if (goColorQty_lst && goColorQty_lst.length > 0) {
          const goColorQty_lst_batchData = [];
          for (const i in goColorQty_lst) {
            const rItem = goColorQty_lst[i].dataValues;
            const newItem = Object.assign({}, rItem);
            const JO_NO = typeof (JO_NO_newList[rItem.JO_NO]) !== 'undefined' ? JO_NO_newList[rItem.JO_NO] : '';
            if (JO_NO) {
              newItem.GO_ID = GO_ID_new;
              newItem.JO_NO = JO_NO;
              delete (newItem.ID);
              goColorQty_lst_batchData.push(newItem);
              // return newItem;
            }
          }
          console.log('goColorQty_lst_batchData');
          console.log(goColorQty_lst_batchData);
          await ctx.model.GoColorQty.bulkCreate(goColorQty_lst_batchData, { transaction });
        }


      }
      await transaction.commit();
    } catch (err) {
      console.log(err.message);
      hasError = 1;
      errorMsg = err.message;
      await transaction.rollback();
    }

    if (hasError) {
      return ctx.jsonReturn(-1, {}, 'Failed', { errorMsg });
    }
    return ctx.jsonReturn(0, 'Successfully');


  }


  /**
   * 详情
   */
  async detail() {
    const { ctx } = this;
    const GO_NO = ctx.request.query.go_no;

    let data = {};
    const res = await ctx.service.go.getDetail(GO_NO);
    if (!res) {
      return ctx.jsonReturn(20002, 'NO Data');
    }
    data = Object.assign({}, res);
    const GO_ID = data.goTitle.GO_ID;
    const Customer_Code = data.goTitle.Customer_Code;
    data.itemList = [];
    data.size_fields = await ctx.service.masterSize.getSizesByCustomerCode(Customer_Code);

    const goColorQty_groupList = _.groupBy(data.goColorQty, function(el) { return el.JO_NO + '_' + el.Color_Code; });
    for (const k in goColorQty_groupList) {
      const k_arr = k.split('_');
      const JO_NO = k_arr[0];
      const Color_Code = k_arr[1];
      const itemList = goColorQty_groupList[k];
      const newItem = {};
      newItem.JO_NO = JO_NO;
      newItem.Color_Code = Color_Code;
      newItem.Color_Combo = itemList[0].Color_Combo;
      newItem.colorQtyList = itemList;
      const goLotInfo = _.filter(data.goLotInfo, { GO_ID, JO_NO });
      newItem.goLotInfo = goLotInfo && goLotInfo.length > 0 ? goLotInfo[0] : null;

      data.itemList.push(newItem);
    }


    return ctx.jsonReturn(0, data, 'success');

  }


  /**
   * 删除数据
   */
  async del() {
    const { ctx } = this;
    const ids = ctx.request.query.id ? ctx.request.query.id : ctx.request.body.id;

    if (!ids) {
      return ctx.jsonReturn(-1, '请选择要删除的数据');
    }
    // const userData = await this.getUserData();
    // const username = userData.username;

    const idsArray = ids.toString().split(',');


    const Op = ctx.model.Op;
    const where = {
      ID: {
        [Op.in]: idsArray,
      },
      // Creater: username,
    };
    const list = await ctx.model.GoTitle.findAll({ where });
    if (list.length === 0) {
      return ctx.jsonReturn(-1, '你不能删除不是自己发布的内容');
    }

    where.Is_Active = 1;
    const res = await ctx.model.GoTitle.update({ Is_Active: 0 }, { where });
    if (res && res[0] > 0) {
      return ctx.jsonReturn(0, 'Successfully');
    }
    return ctx.jsonReturn(-1, 'Failed');


  }

}


module.exports = GoController;
