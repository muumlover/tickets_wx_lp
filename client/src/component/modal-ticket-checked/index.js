/**
 * muumlover@2019-05-27
 * 票券检查对话框
 * 1、显示票券和领取用户的基本信息
 */
import Taro, {Component} from "@tarojs/taro"
import {Button, Text, View} from "@tarojs/components"
import {AtModal, AtModalAction, AtModalContent, AtModalHeader, AtToast} from "taro-ui"
import {checkedTicket, inspectTicket} from "../../apis";
import "./index.scss"
import {ticketClass} from "../../config";

export default class Index extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      tOpened: true,
      tText: "票券信息加载中...",
      ticketShow: false,
      ticketTitle: "",
      ticketDate: "",
      ticketState: "",
      userOpenId: ""
    }
  }

  onReturn = (res) => {
    this.setState({tOpened: true, ticketShow: false});
    this.props.onReturn(res);
  };

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.props["isOpened"] === true && prevProps["isOpened"] === false) {
      const {ticketId} = this.props;
      //查询并显示票券详细信息
      inspectTicket(ticketId).then((res) => {
        this.setState({tOpened: false});
        if (res.code !== 0) {
          Taro.showModal({content: res.message, showCancel: false}).then(() => {
            this.onReturn(false);
          });
        } else {
          this.setState({
            ticketShow: true,
            ticketTitle: ticketClass[res.ticket["class"]],
            ticketDate: res.ticket["expiry_date"],
            ticketState: res.ticket["state"],
            userOpenId: res.user["wx_open_id"],
          });
        }
      });
    }
  }

  /**
   * 提交使用票券
   */
  onConfirm = (ticketId) => {
    this.setState({tOpened: true, tText: "使用请求中.."});
    checkedTicket(ticketId).then((res) => {
      this.setState({tOpened: false});
      if (res.code !== 0) {
        Taro.showModal({content: res.message, showCancel: false}).then(() => {
          this.onReturn(false);
        })
      } else {
        Taro.showModal({content: "使用成功", showCancel: false}).then(() => {
          this.onReturn(true);
        })
      }
    })
  };

  render() {
    const {isOpened, ticketId} = this.props;
    const {ticketShow, ticketTitle, ticketDate, ticketState, userOpenId, tOpened, tText} = this.state;
    // noinspection JSXNamespaceValidation
    return (
      isOpened &&
      <View class="container">
        <AtToast isOpened={tOpened} text={tText} status="loading" duration={0} hasMask/>
        <AtModal isOpened={ticketShow} onClose={this.onReturn.bind(this)}>
          <AtModalHeader>详情</AtModalHeader>
          <AtModalContent>
            <View className="page-section">
              <View className="page-section-title">
                <Text>项目：{ticketTitle}</Text>
              </View>
              <View className="page-section-title">
                <Text>券码：{ticketId}</Text>
              </View>
              <View className="page-section-title">
                <Text>使用日期：{ticketDate}</Text>
              </View>
              <View className="page-section-title">
                <Text>用户信息：{userOpenId}</Text>
              </View>
              {ticketState !== "valid" &&
              <View className="page-section-title">
                <Text>该票券无法使用</Text>
              </View>}
            </View>
          </AtModalContent>
          <AtModalAction>
            {ticketState === "valid" &&
            <Button onClick={this.onConfirm.bind(this, ticketId)}>立即使用</Button>}
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}
