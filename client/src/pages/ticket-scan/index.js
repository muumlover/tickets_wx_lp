/**
 * muumlover@2019-05-27
 * 票券扫描页面
 * 1、提供扫描票券功能
 * 2、显示票券信息供人工核实
 * 3、TODO 显示扫描历史
 */
import Taro from "@tarojs/taro"
import {View} from "@tarojs/components"
import {AtButton, AtInput} from "taro-ui"
import "./index.scss"
import TicketTabBar from "../../component/tab-bar"
import ModalTicketDisplay from "../../component/modal-ticket-checked";
import {ticketOption} from "../../config";
import {ticketLog} from "../../apis";
import {getNowDay} from "../../common/getWeek";

export default class Index extends Taro.Component {
  config = {
    navigationBarBackgroundColor: "#383c42",
    navigationBarTextStyle: "white",
    navigationBarTitleText: "票券使用",
    enablePullDownRefresh: true,
  };

  constructor() {
    super(...arguments);
    this.state = {
      ticketId: "",
      modalTicketDisplayShow: false,
      ticketCheckList: []
    }
  }

  componentDidShow() {
    Taro.startPullDownRefresh();
  }

  onPullDownRefresh() {
    this.updateTicketCheckList();
  }

  /**
   * 更新票券列表记录
   */
  updateTicketCheckList = () => {
    let {ticketCheckList} = this.state;
    const nowDate = getNowDay();
    ticketLog(0, 5).then(res => {
      console.log(res);
      ticketCheckList = res.items;
      Taro.stopPullDownRefresh();
      Taro.showToast({title: "加载成功", icon: "none", duration: 500});
      this.setState({ticketCheckList, openIndex: -1, tOpened: false});
    }).catch(err => {
      console.error(err);
      Taro.stopPullDownRefresh();
      Taro.showToast({title: "加载失败", icon: "none", duration: 500});
    });
  };

  /**
   * 保存输入框数据更改
   * @param value
   */
  handleInputChange = (value) => {
    this.setState({ticketId: value})
  };

  /**
   * 开启微信扫描
   */
  onBtnScanClick = () => {
    Taro.scanCode().then((res) => this.modalTicketDisplayShow(res.result))
  };

  /**
   * 显示票券详情对话框
   * @param ticketId 票券ID
   */
  modalTicketDisplayShow = (ticketId) => {
    this.setState({
      ticketId: ticketId,
      modalTicketDisplayShow: true,
    })
  };

  /**
   * 关闭券详情对话框操作
   */
  modalTicketDisplayHide = () => {
    this.setState({
      ticketId: "",
      modalTicketDisplayShow: false
    })
  };

  render() {
    const {ticketId, modalTicketDisplayShow, ticketCheckList} = this.state;
    // noinspection JSXNamespaceValidation
    return (
      <View class="container">
        <ModalTicketDisplay
          isOpened={modalTicketDisplayShow}
          onHide={this.modalTicketDisplayHide.bind(this)}
          ticketId={ticketId}
        />
        <View class="tickets-scan">
          <View class="input-container">
            <AtInput border={false} value={ticketId} onChange={this.handleInputChange.bind(this)}
                     placeholder="扫描或输入票券编号"
            >
              <AtButton type="primary" onClick={this.modalTicketDisplayShow.bind(this, ticketId)}>确定</AtButton>
            </AtInput>
            <AtButton type="primary" onClick={this.onBtnScanClick.bind(this)}>扫描</AtButton>
          </View>
          <View class="btn-submit">
          </View>
        </View>
        <View class="ticket-log">
          <View class="list">
            {ticketCheckList.length > 0 ?
              <View>
                {ticketCheckList.map((item, index) => (
                  <View key={index} class="item">
                    <View class="time">{item.time}</View>
                    <View class="text">
                      {`${item["real_name"]} ${ticketOption[item["option"]]} ${item["ticket_id"].substr(0, 20)}`}
                    </View>
                  </View>
                ))}
                <AtLoadMore
                  className={"load-more"}
                  onClick={this.handleClick.bind(this)}
                  status={this.state.status}
                />
              </View>
              :
              <View class="item none">没有记录</View>
            }
          </View>
        </View>
        <TicketTabBar/>
      </View>
    )
  }
}
