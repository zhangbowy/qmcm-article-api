import {think} from "thinkjs";
module.exports = [
    {
        interval: '5s',
        immediate: true,
        enable: false,
        handle: async () => {
            think.fetch("https://live.douyin.com/webcast/room/chat/?aid=6383&live_id=1&device_platform=web&language=zh-CN&room_id=7075712374191557411&content=%E9%98%BF%E8%92%8B%E5%AE%9D%E5%AE%9D&type=0&msToken=kvVkPvVHp0V-hn9S5z4YGuv8OPHiN8cFgTh2n3jwzQkRT_N1zsdn9e0S3Zvke-G3v64VaEc8fTWsBOe5j7oxlhdWEAJTNiLHOXRHWXKSAvBdYwV2g3PCqdoXH6c4S9s=&X-Bogus=DFSzsdVLuRtANHeKSR-BBr7TlqCK&_signature=_02B4Z6wo00001D3GX6gAAIDDqRAEp9Yd7Fg9wlsAAG1KzkGNZvPL4kFQ8owWdcU.5DyHUMNHNmPt9RpbG6WDEO636uLoQ63iZleqUt0tx4Iz0i9I3BUZToS1e2oM.JCNmXsjJDdyqNEmysT874", {
                "headers": {
                  "accept": "application/json, text/plain, */*",
                  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                  "cache-control": "no-cache",
                  "pragma": "no-cache",
                  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "cookie": "ttwid=1%7CL5MPEDpDdA1Wvuyn1apMEM1CK0TtFwJ0E16tm0M-OhI%7C1647446313%7Cd2d1aec42902b0ff0fa3b2a18072151c410743da29e22a8542f5e019c63658f2; strategyABtestKey=1647446316.296; passport_csrf_token=aeb84a9f273efdceacf2f4515934e071; passport_csrf_token_default=aeb84a9f273efdceacf2f4515934e071; AB_LOGIN_GUIDE_TIMESTAMP=1647446316032; n_mh=1YTXSobqHHSlCr_-anfPBg6VMLLKAWNoMJKF3SF_xBk; sso_uid_tt=fa565def138919aeae5d55a4eef66450; sso_uid_tt_ss=fa565def138919aeae5d55a4eef66450; toutiao_sso_user=1d91205dabef44b9f837fbbac9b3716e; toutiao_sso_user_ss=1d91205dabef44b9f837fbbac9b3716e; sid_ucp_sso_v1=1.0.0-KGQwZDk5NWFhNTcwOGJhYTk2MDhkMGQ3ZTlmZWNkMTE5YjExM2QyNzMKHQj48YTdggIQv5LIkQYY7zEgDDDO__PNBTgGQPQHGgJsZiIgMWQ5MTIwNWRhYmVmNDRiOWY4MzdmYmJhYzliMzcxNmU; ssid_ucp_sso_v1=1.0.0-KGQwZDk5NWFhNTcwOGJhYTk2MDhkMGQ3ZTlmZWNkMTE5YjExM2QyNzMKHQj48YTdggIQv5LIkQYY7zEgDDDO__PNBTgGQPQHGgJsZiIgMWQ5MTIwNWRhYmVmNDRiOWY4MzdmYmJhYzliMzcxNmU; odin_tt=941bc6371102e6d3a32ae217ef331ce79850b87cf9a940a9149e1edd824b0db1c6e96c0e276614670e9d2432f13409ee; passport_auth_status=2ba9fd1abff356c2898b8661eedda2a8%2C; passport_auth_status_ss=2ba9fd1abff356c2898b8661eedda2a8%2C; sid_guard=38e177ac012b7cd07946624f835d6158%7C1647446337%7C5183998%7CSun%2C+15-May-2022+15%3A58%3A55+GMT; uid_tt=2686dca7d39f6821285d1db37649a9ee; uid_tt_ss=2686dca7d39f6821285d1db37649a9ee; sid_tt=38e177ac012b7cd07946624f835d6158; sessionid=38e177ac012b7cd07946624f835d6158; sessionid_ss=38e177ac012b7cd07946624f835d6158; sid_ucp_v1=1.0.0-KDFlZWUxYTZiZDQ5MjJjZDcxYzkyNDcxNGIyYjZlMDlkZDc2OTdiM2EKFwj48YTdggIQwZLIkQYY7zEgDDgGQPQHGgJobCIgMzhlMTc3YWMwMTJiN2NkMDc5NDY2MjRmODM1ZDYxNTg; ssid_ucp_v1=1.0.0-KDFlZWUxYTZiZDQ5MjJjZDcxYzkyNDcxNGIyYjZlMDlkZDc2OTdiM2EKFwj48YTdggIQwZLIkQYY7zEgDDgGQPQHGgJobCIgMzhlMTc3YWMwMTJiN2NkMDc5NDY2MjRmODM1ZDYxNTg; FOLLOW_LIVE_POINT_INFO=MS4wLjABAAAAsFWLgB8Fui_k4cca6_N3qDlXog8ADMAdzU7WTAy7RvI%2F1647446400000%2F0%2F1647446340082%2F0; home_can_add_dy_2_desktop=0; __ac_nonce=062320973008fcdcc4918; __ac_signature=_02B4Z6wo00f01FKwFIQAAIDDxmZPi2CNk1xSkBAAAHal76; ttcid=8f5466605c0c4295b3aa414b0ae2ddb118; xgplayer_user_id=992454006995; MONITOR_WEB_ID=c497b608-7cac-4b60-931d-eae4853f8e20; csrf_session_id=3c8c789f9cce94ef5c572538bc641e24; s_v_web_id=verify_l0tr1nw2_TW2F0jli_JuQB_4EvF_AnEM_EuxdKGMqWI6g; pwa_guide_count=1; THEME_STAY_TIME=299293; IS_HIDE_THEME_CHANGE=1; msToken=kvVkPvVHp0V-hn9S5z4YGuv8OPHiN8cFgTh2n3jwzQkRT_N1zsdn9e0S3Zvke-G3v64VaEc8fTWsBOe5j7oxlhdWEAJTNiLHOXRHWXKSAvBdYwV2g3PCqdoXH6c4S9s=; live_can_add_dy_2_desktop=1; tt_scid=vjUIk88riRYk2N2oUj9.LB5hZFBRfONK7CO6e4vjQVT2tJjf3yL0DCW5qxdWsJdl6027; msToken=JG6YdESzCc7TQsAdRKbvrG2QvzHDSBX9jw_DPUILT5ekhNFRk9q8sKabIaEp2P-s-z98icLcmBlkvL4vBmVoEamDir2L8NwIRDwF017xw1qmmAXcARBCZJ1k5h36sw0=",
                  "Referer": "https://live.douyin.com/461651982195",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
              }).then((res) => {
                  return res.json()
              }).then(res2 => {
                  console.log(res2, '--')
              })
      }
    }
];
