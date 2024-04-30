import { Animal } from "../../../../shared/types"

export default (animal: Animal) => `
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5"
    role="presentation"
    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #99c0c9; background-size: auto;"
    width="100%">
    <tbody>
        <tr>
            <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0"
                    class="row-content stack" role="presentation"
                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; color: #000000; width: 650px; margin: 0 auto;"
                    width="650">
                    <tbody>
                        <tr>
                            <td class="column column-1"
                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                width="50%">
                                <div class="spacer_block block-1"
                                    style="height:15px;line-height:15px;font-size:1px;"> </div>
                                <table border="0" cellpadding="0" cellspacing="0"
                                    class="heading_block block-3" role="presentation"
                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                    width="100%">
                                    <tr>
                                        <td class="pad"
                                            style="padding-left:20px;text-align:center;width:100%;">
                                            <h2
                                                style="margin: 0; color: #086064; direction: ltr; font-family: 'Oxygen', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; font-size: 23px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 27.599999999999998px;">
                                                <strong>${animal.name}</strong>
                                            </h2>
                                        </td>
                                    </tr>
                                </table>
                                <table border="0" cellpadding="0" cellspacing="0"
                                    class="paragraph_block block-4" role="presentation"
                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                    width="100%">
                                    <tr>
                                        <td class="pad"
                                            style="padding-bottom:10px;padding-left:20px;padding-right:55px;padding-top:10px;">
                                            <div
                                                style="color:#4a4444;direction:ltr;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:1px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                <p style="margin: 0;">${animal.sex} ${animal.type} - ${animal.ageType}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                <table border="0" cellpadding="0" cellspacing="0"
                                    class="button_block block-5" role="presentation"
                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                    width="100%">
                                    <tr>
                                        <td class="pad"
                                            style="padding-bottom:35px;padding-left:20px;padding-right:10px;text-align:left;">
                                            <div align="left" class="alignment"><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${animal.url}" style="height:46px;width:267px;v-text-anchor:middle;" arcsize="10%" strokeweight="0.75pt" strokecolor="#086064" fillcolor="#99c0c9">
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center style="color:#086064; font-family:Arial, sans-serif; font-size:15px">
<![endif]--><a href="${animal.url}" style="text-decoration:none;display:inline-block;color:#086064;background-color:#99c0c9;border-radius:4px;width:auto;border-top:1px solid #086064;font-weight:400;border-right:1px solid #086064;border-bottom:1px solid #086064;border-left:1px solid #086064;padding-top:5px;padding-bottom:5px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:15px;text-align:center;mso-border-alt:none;word-break:keep-all;"
                                                    target="_blank"><span
                                                        style="padding-left:20px;padding-right:20px;font-size:15px;display:inline-block;letter-spacing:normal;"><span
                                                            style="word-break:break-word;"><span
                                                                data-mce-style=""
                                                                style="line-height: 30px;">Click here for more info on ${animal.name}</span></span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td class="column column-2"
                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                width="50%">
                                <table border="0" cellpadding="0" cellspacing="0"
                                    class="image_block block-1" role="presentation"
                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                    width="100%">
                                    <tr>
                                        <td class="pad" style="width:100%;">
                                            <div align="center" class="alignment"
                                                style="line-height:10px">
                                                <div style="max-width: 264px;"><img
                                                        alt="animal" height="auto"
                                                        src="${animal.imageUrl}"
                                                        style="display: block; height: auto; border: 0; width: 100%;"
                                                        title="animal" width="264" /></div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6"
    role="presentation"
    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #99c0c9;" width="100%">
    <tbody>
        <tr>
            <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0"
                    class="row-content stack" role="presentation"
                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 650px; margin: 0 auto;"
                    width="650">
                    <tbody>
                        <tr>
                            <td class="column column-1"
                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                width="100%">
                                <div class="spacer_block block-1"
                                    style="height:45px;line-height:45px;font-size:1px;"> </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`