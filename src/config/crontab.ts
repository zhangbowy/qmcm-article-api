import {think} from "thinkjs";
module.exports = [
    {
        interval: '20s',
        immediate: true,
        enable: false,
        handle: async () => {
//             think.fetch("https://www.baidu.com/s?wd=%E5%88%BA%E7%BB%A3%E5%AE%9A%E5%88%B6%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88&rsv_spt=1&rsv_iqid=0x9d315751001313ae&issp=1&f=3&rsv_bp=1&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_dl=ih_1&rsv_enter=1&rsv_sug3=1&rsv_sug1=1&rsv_sug7=001&rsv_sug2=1&rsv_btype=i&rsp=1&rsv_sug9=es_2_1&rsv_sug4=742&rsv_sug=6", {
//   headers: {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//     "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
//     "cache-control": "max-age=0",
//     "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "same-origin",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     "cookie": "BIDUPSID=BE0A2ECED95A076061DCE2D76FD7E13C; PSTM=1611897245; BDUSS=x-VG0tUUEyTm9-bDVtS0dxMjZ6T2c1R355eXM1elBVZkN5N35KTkFwNVhpenhnRVFBQUFBJCQAAAAAAAAAAAEAAADpLfun1cWyqXd5MTMxNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFf-FGBX~hRgck; BDUSS_BFESS=x-VG0tUUEyTm9-bDVtS0dxMjZ6T2c1R355eXM1elBVZkN5N35KTkFwNVhpenhnRVFBQUFBJCQAAAAAAAAAAAEAAADpLfun1cWyqXd5MTMxNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFf-FGBX~hRgck; __yjs_duid=1_e2b500285a9b877b731b25af1dd4f3241620375186132; BD_UPN=123253; BAIDUID=6FD08E20D43409342002FC048A1605A3:FG=1; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; H_WISE_SIDS=110085_127969_131861_174434_184716_185637_188749_189755_191067_191245_194085_195343_195623_196425_196527_197241_197471_197711_197947_197956_199575_200993_201537_201708_202059_202894_202910_203075_203192_203266_203360_203518_203525_203606_203885_203990_204032_204098_204131_204255_204305_204778_204824_204859_204915_204973_205077_205087_205218_205220_205383_205485_205831_205910_205958_206008_206099_206123_206476_206516_206729_206871_206906_207008_207148_207236_207364_207555_207616_207625_207715_207865_8000073_8000121_8000136_8000149_8000159_8000174_8000185_8000187; plus_cv=1::m:7.94e+147; MSA_WH=513_789; BDSFRCVID=vukOJexroG0Ry8bDMYLVbcvAHeKKv7TTDYrECenrWhab4-CVJeC6EG0PtEeydEu-EHtdogKKKgOTHICF_2uxOjjg8UtVJeC6EG0Ptf8g0M5; H_BDCLCKID_SF=fnCDVIP-fIvbfP0k5tOqKPnH-UIsB47lB2Q-5KL-yJL2OMb-QMFb0t40eh3XQncj3N7CbxbdJJjojhomXJ5pM-rW3no-afQKKmTxoUt-5DnJhhvGqt5KBUkebPRiB-b9QgbA5hQ7tt5W8ncFbT7l5hKpbt-q0x-jLTnhVn0M5DK0hCtwDjKbjjJM5pJfeJ3e2IIX3b7Ef-b6_p7_bf--Dx_Lha7bJM3ufG62LInFaPbR8nj1h4nxy5KEDnQZWxvxL2o9WpKyafTrDIoHQT3m0nvbbN3i-4jJaC78Wb3cWhvJ8UbSyfbPBTD02-nBat-OQ6npaJ5nJq5nhMJmb67JD-50eGLs-njt-5PX3JjV5PK_Hn7zeIcnyU4pbq7H2M-jJNQE_lbzQPQzfDnxhl0V2qLzQbOn0pcH3mjr_JAa5Ju2jJTM3x6qLTKkQN3T-n3BXKQGKT6NWPbfDn3oyURJXp0nytbly5jtMgOBBJ0yQ4b4OR5JjxonDh83bG7MJUutfJujVC_5tD_3fP36qROHM4FD-eT22-uX2I0sh4OoBhcqEIL4htkKhxPwQ-clBtrP2RkL0RC-Lq7BDUbSj4Qoeb5BqecQWMbgtKTR5CToth5nhMt43j7JDMP0qJnHqloy523iab3vQpnzEpQ3DRoWXPIqbN7P-p5Z5mAqKl0MLPbtbb0xb6_0DjPV-frBa4o3KC8X3JjV5PK_Hn7zenjhMU4pbq7H2M-jLjKO3qbzylR4HROCLf7qyUPBjnOn0pcH3m7-Wto62njDM56J3x6qLTKkQN3T-UQ-MCn4L66NWPbfDn3oyURJXp0nytbly5jtMgOBBJ0yQ4b4OR5JjxonDh83bG7MJUutfD7H3KCbJK8hhfK; BDSFRCVID_BFESS=vukOJexroG0Ry8bDMYLVbcvAHeKKv7TTDYrECenrWhab4-CVJeC6EG0PtEeydEu-EHtdogKKKgOTHICF_2uxOjjg8UtVJeC6EG0Ptf8g0M5; H_BDCLCKID_SF_BFESS=fnCDVIP-fIvbfP0k5tOqKPnH-UIsB47lB2Q-5KL-yJL2OMb-QMFb0t40eh3XQncj3N7CbxbdJJjojhomXJ5pM-rW3no-afQKKmTxoUt-5DnJhhvGqt5KBUkebPRiB-b9QgbA5hQ7tt5W8ncFbT7l5hKpbt-q0x-jLTnhVn0M5DK0hCtwDjKbjjJM5pJfeJ3e2IIX3b7Ef-b6_p7_bf--Dx_Lha7bJM3ufG62LInFaPbR8nj1h4nxy5KEDnQZWxvxL2o9WpKyafTrDIoHQT3m0nvbbN3i-4jJaC78Wb3cWhvJ8UbSyfbPBTD02-nBat-OQ6npaJ5nJq5nhMJmb67JD-50eGLs-njt-5PX3JjV5PK_Hn7zeIcnyU4pbq7H2M-jJNQE_lbzQPQzfDnxhl0V2qLzQbOn0pcH3mjr_JAa5Ju2jJTM3x6qLTKkQN3T-n3BXKQGKT6NWPbfDn3oyURJXp0nytbly5jtMgOBBJ0yQ4b4OR5JjxonDh83bG7MJUutfJujVC_5tD_3fP36qROHM4FD-eT22-uX2I0sh4OoBhcqEIL4htkKhxPwQ-clBtrP2RkL0RC-Lq7BDUbSj4Qoeb5BqecQWMbgtKTR5CToth5nhMt43j7JDMP0qJnHqloy523iab3vQpnzEpQ3DRoWXPIqbN7P-p5Z5mAqKl0MLPbtbb0xb6_0DjPV-frBa4o3KC8X3JjV5PK_Hn7zenjhMU4pbq7H2M-jLjKO3qbzylR4HROCLf7qyUPBjnOn0pcH3m7-Wto62njDM56J3x6qLTKkQN3T-UQ-MCn4L66NWPbfDn3oyURJXp0nytbly5jtMgOBBJ0yQ4b4OR5JjxonDh83bG7MJUutfD7H3KCbJK8hhfK; delPer=0; BD_CK_SAM=1; PSINO=5; BAIDUID_BFESS=6FD08E20D43409342002FC048A1605A3:FG=1; BDRCVFR[SHOOb3ODEBt]=mk3SLVN4HKm; BAIDUID_V4=B78D2236DF58235734974F0CEBA1283C:FG=1; H_PS_PSSID=36067_31660_34813_36166_34584_36074_35994_26350_36115_35723; ab_sr=1.0.1_MTJlZTM5YmM4Njc5ZTc2MTgzYTIwNWJkYTY4NzYzZTcyNjgyMWM0ZDIxODIyYjUyZDk4ZDczYTQyZjY1OTk0ZWJmNWQxZTU5Zjg5YTcwZGViZTczOTQ5YjE3NmI1Nzg3MDJmMmEwMTAwYzI0MTExNTUwNDk2MzIzZTU0NzA4ZDJjMDMzZWI0MDQ0YmY1YzEwMGUzZmRjYmY4NTFiMmI0ZTg1ZTY5YmQ3MWI4YzFmNjFiOWExMWY2ZWYzMWQ0MGVi; BD_HOME=1; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; H_PS_645EC=aa7bRrd8whxP4xxy%2B3OpEuBLj8oGkHzFa6w5hMiMHFO1Mi7BuIh9i5ughMGNH%2B%2BcfOo6; BA_HECTOR=a1aha1240020ak8h361h3oln50r; BDSVRTM=163; COOKIE_SESSION=773_0_9_9_5_11_1_0_9_9_1_0_165_0_0_0_1648120817_0_1648121573%7C9%2358860_603_1648086624%7C9",
//     "Referer": "https://www.baidu.com/my/index",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// }).then((res) => {
//     return res.text()
// }).then(res2 => {
//     console.log(res2, '--')
// })
// }
            var exec = require('child_process').exec;

            var cmdStr = `curl 'http://www.baidu.com/link?url=PIt_eD6xMqwScIBsW8pGbaYEZQEaJUcqwch52RFwIAPd7nHyfaBt2s6a2nCqcj48' \
-H 'Connection: keep-alive' \
-H 'Cache-Control: max-age=0' \
-H 'sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'Upgrade-Insecure-Requests: 1' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36' \
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
-H 'Sec-Fetch-Site: same-origin' \
-H 'Sec-Fetch-Mode: navigate' \
-H 'Sec-Fetch-User: ?1' \
-H 'Sec-Fetch-Dest: document' \
-H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' \
-H 'Cookie: BIDUPSID=BE0A2ECED95A076061DCE2D76FD7E13C; PSTM=1611897245; BDUSS=x-VG0tUUEyTm9-bDVtS0dxMjZ6T2c1R355eXM1elBVZkN5N35KTkFwNVhpenhnRVFBQUFBJCQAAAAAAAAAAAEAAADpLfun1cWyqXd5MTMxNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFf-FGBX~hRgck; BDUSS_BFESS=x-VG0tUUEyTm9-bDVtS0dxMjZ6T2c1R355eXM1elBVZkN5N35KTkFwNVhpenhnRVFBQUFBJCQAAAAAAAAAAAEAAADpLfun1cWyqXd5MTMxNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFf-FGBX~hRgck; __yjs_duid=1_e2b500285a9b877b731b25af1dd4f3241620375186132; BD_UPN=123253; BAIDUID=6FD08E20D43409342002FC048A1605A3:FG=1; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; H_WISE_SIDS=110085_127969_131861_174434_184716_185637_188749_189755_191067_191245_194085_195343_195623_196425_196527_197241_197471_197711_197947_197956_199575_200993_201537_201708_202059_202894_202910_203075_203192_203266_203360_203518_203525_203606_203885_203990_204032_204098_204131_204255_204305_204778_204824_204859_204915_204973_205077_205087_205218_205220_205383_205485_205831_205910_205958_206008_206099_206123_206476_206516_206729_206871_206906_207008_207148_207236_207364_207555_207616_207625_207715_207865_8000073_8000121_8000136_8000149_8000159_8000174_8000185_8000187; plus_cv=1::m:7.94e+147; MSA_WH=513_789; delPer=0; BD_CK_SAM=1; PSINO=5; BAIDUID_BFESS=6FD08E20D43409342002FC048A1605A3:FG=1; BDRCVFR[SHOOb3ODEBt]=mk3SLVN4HKm; BAIDUID_V4=B78D2236DF58235734974F0CEBA1283C:FG=1; ab_sr=1.0.1_MTJlZTM5YmM4Njc5ZTc2MTgzYTIwNWJkYTY4NzYzZTcyNjgyMWM0ZDIxODIyYjUyZDk4ZDczYTQyZjY1OTk0ZWJmNWQxZTU5Zjg5YTcwZGViZTczOTQ5YjE3NmI1Nzg3MDJmMmEwMTAwYzI0MTExNTUwNDk2MzIzZTU0NzA4ZDJjMDMzZWI0MDQ0YmY1YzEwMGUzZmRjYmY4NTFiMmI0ZTg1ZTY5YmQ3MWI4YzFmNjFiOWExMWY2ZWYzMWQ0MGVi; BD_HOME=1; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; shifen[315318440420_62682]=1648121937; BCLID=9347498315004540404; BDSFRCVID=NU_OJeC62R6bI03DhbQJMUgEDKes0wcTH6aVGqIIdKMuLvcPYX1mEG0PMM8g0Kub9I_0ogKK0eOTH6KF_2uxOjjg8UtVJeC6EG0Ptf8g0f5; H_BDCLCKID_SF=tR3JQt5bbTrDHJTg5DTjhPrMqtJiWMT-MTryKKt2ytFhsh625xrheb8H02c8Lx5RQNnRh4oNBl4-DI5Ih63EMq8ZyxomtfQxtNRJLnc72qoUKq5S5-OobUPUyUJ9LUvA02cdot5yBbc8eIna5hjkbfJBQttjQn3hfIkj2CKLtDtBhC04D6Rb5nbH5MQBa4rKHD7yW6rS2KvZqnvOy4oTj6DDha5XBhjRBmcZWx5VJ56qDDo-Xnro3MvB-fPO-jKLHCJ9KM8b5lbNbJkRQft205DAeMtjBbLLX5u8bR7jWhvvep72yMrTQlRX5q79atTMfNTJ-qcH0KQpsIJM5-DWbT8EjHCDq-jK2CQ03Rnqa5rDHJTg5DTjhPrM5loWWMT-MTryKKJ4MCnDsh6XXhjD-nKFyMoiBbKfQNnRh4oN0b5_qx3d-tKMqftZyxomtfQxtNRJKR5X5p5hKq5S5-OobUPUyUJ9LUvA02cdot5yBbc8eIna5hjkbfJBQttjQn3hfIkj2CKLtKtWhD-6jT_3b-L3-frQej_qfn-X3b7Efb7kfh7_bf--DljB-4ujJM33KH6U2x5j3lbvet8x5Pbxy5K_34JDBxcbW2jt2PQJLUTihJ6HQT3mXfrbbN3i-4D8WG8jWb3cWKJq8UbSjxRPBTD02-nBat-OQ6npaJ5nJq5nhMJmb67JD-50eG-jqT_JJbktVbbHbnjED5ulj6AWq4tehHRwLlR9WDTm_Do4JJozhKOeM-5GyxuAbPoRB-QetTv2-pPKKxQnqqTVbMRY5fAB-n3kXToL3mkjbp6zfn02OP5PefrrD-4syP4jKxRnWnciKfA-b4ncjRcTehoM3xI8LNj405OTbIFO0KJDJCcjqR8Zjj-KD53P; BCLID_BFESS=9347498315004540404; BDSFRCVID_BFESS=NU_OJeC62R6bI03DhbQJMUgEDKes0wcTH6aVGqIIdKMuLvcPYX1mEG0PMM8g0Kub9I_0ogKK0eOTH6KF_2uxOjjg8UtVJeC6EG0Ptf8g0f5; H_BDCLCKID_SF_BFESS=tR3JQt5bbTrDHJTg5DTjhPrMqtJiWMT-MTryKKt2ytFhsh625xrheb8H02c8Lx5RQNnRh4oNBl4-DI5Ih63EMq8ZyxomtfQxtNRJLnc72qoUKq5S5-OobUPUyUJ9LUvA02cdot5yBbc8eIna5hjkbfJBQttjQn3hfIkj2CKLtDtBhC04D6Rb5nbH5MQBa4rKHD7yW6rS2KvZqnvOy4oTj6DDha5XBhjRBmcZWx5VJ56qDDo-Xnro3MvB-fPO-jKLHCJ9KM8b5lbNbJkRQft205DAeMtjBbLLX5u8bR7jWhvvep72yMrTQlRX5q79atTMfNTJ-qcH0KQpsIJM5-DWbT8EjHCDq-jK2CQ03Rnqa5rDHJTg5DTjhPrM5loWWMT-MTryKKJ4MCnDsh6XXhjD-nKFyMoiBbKfQNnRh4oN0b5_qx3d-tKMqftZyxomtfQxtNRJKR5X5p5hKq5S5-OobUPUyUJ9LUvA02cdot5yBbc8eIna5hjkbfJBQttjQn3hfIkj2CKLtKtWhD-6jT_3b-L3-frQej_qfn-X3b7Efb7kfh7_bf--DljB-4ujJM33KH6U2x5j3lbvet8x5Pbxy5K_34JDBxcbW2jt2PQJLUTihJ6HQT3mXfrbbN3i-4D8WG8jWb3cWKJq8UbSjxRPBTD02-nBat-OQ6npaJ5nJq5nhMJmb67JD-50eG-jqT_JJbktVbbHbnjED5ulj6AWq4tehHRwLlR9WDTm_Do4JJozhKOeM-5GyxuAbPoRB-QetTv2-pPKKxQnqqTVbMRY5fAB-n3kXToL3mkjbp6zfn02OP5PefrrD-4syP4jKxRnWnciKfA-b4ncjRcTehoM3xI8LNj405OTbIFO0KJDJCcjqR8Zjj-KD53P; baikeVisitId=25a231e8-23c1-40ba-af92-ca1a4d2a1d49; H_PS_PSSID=36067_31660_34813_36166_34584_36074_35994_26350_36115_35723; H_PS_645EC=b7a30UsfuYzvKe8JVKCZp%2FXAHaQIazn%2Bif%2BI05%2FfhMnwUKMebUNMzB4VqtyThm2NlfY7rTiWwcPaGA%2Fs; BA_HECTOR=2404a52h0g008g8knb1h3om5p0r; COOKIE_SESSION=6_0_9_9_5_10_0_0_9_8_1_0_165_0_0_0_1648120817_0_1648122040%7C9%2358860_603_1648086624%7C9; BDSVRTM=302' \
--compressed`;

            exec(cmdStr, function(err, stdout, stderr) {

                if (err) {

                    console.log('get weather api error:' + stderr);

                } else {

                    /*

                    这个stdout的内容就是上面我curl出来的这个东西：
                    */

                    // var data = JSON.parse(stdout);

                    // console.log(stdout);

                }

            });
        }
    },
    {
        interval: '8s',
        immediate: true,
        enable: false,
        handle: async () => {
            var exec = require('child_process').exec;

            var cmdStr = `curl 'http://www.baidu.com/link?url=hDl9RhGhRMIcPpjQS1Yk5a9N35cB9_4cd_Xz5JFbBjGNBVzupN7P52O60f-DaAb8' \\
-X 'GET' \\
-H 'Cookie: ispeed_lsm=10; COOKIE_SESSION=18226_0_9_9_5_27_1_3_9_8_1_1_5693_0_0_0_1648103176_0_1648121420%7C9%230_0_1648121420%7C1; BA_HECTOR=8l2ha0848l002kakk11h3olid0r; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; H_PS_PSSID=35835_31253_36022_34812_35912_36166_34584_36140_36120_36035_35864_35320_26350_35723_36102; PSINO=5; delPer=0; BDSVRTM=129; BD_CK_SAM=1; H_PS_645EC=30b9uFb0O0iygWzo%2B5KTb1EQR%2BHByLTP%2BNc0RGmZ1A6%2F1QjZr1j5rvSMN98; BD_UPN=143254; BD_HOME=1; Hm_lpvt_aec699bb6442ba076c8981c6dc490771=1648097480; Hm_lvt_aec699bb6442ba076c8981c6dc490771=1648093431; BDRCVFR[d9MwMhSWl4T]=mk3SLVN4HKm; BIDUPSID=14F758FC107735F5D41B65CE4F965A76; BAIDUID=06F8CA66A2F699F83A9C0A8EB2BC152D:FG=1; PSTM=1648093354' \\
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \\
-H 'Host: www.baidu.com' \\
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15' \\
-H 'Accept-Language: zh-cn' \\
-H 'Accept-Encoding: gzip, deflate, br' \\
-H 'Connection: keep-alive'`;

            exec(cmdStr, function(err, stdout, stderr) {

                if (err) {

                    console.log('get weather api error:' + stderr);

                } else {

                    /*

                    这个stdout的内容就是上面我curl出来的这个东西：
                    */

                    // var data = JSON.parse(stdout);

                    console.log(stdout);

                }

            });
        }
    },
    {
        interval: '1h',
        immediate: true,
        enable: true,
        handle: '/article/seo'
    }

];
