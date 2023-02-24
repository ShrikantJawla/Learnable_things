const { pool } = require("../../../configration/database")

let sequenceModel = {}

sequenceModel.getCardIssuersApplySequenceWithApplyNow = async function () {
    const query = `SELECT id,"IssuerName","ApplySequence" from card_issuers where "ApplyNow"='true'`
    let returnData = []
    try {
        let queryData = await pool.query(query)
        // console.log(queryData.rows)
        returnData = queryData.rows
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}
sequenceModel.getCreditCardsApplySequenceWithApplyNow = async function () {
    const query = `SELECT id,"CreditCardName","Applynowsequence" from credit_cards where "applyNow"='true' `
    let returnData = []
    try {
        let queryData = await pool.query(query)
        // console.log(queryData.rows)
        returnData = queryData.rows
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}
sequenceModel.getCardIssuerWithSequence = async function () {
    const query = `SELECT id,"IssuerName",sequence from card_issuers`
    let returnData = []
    try {
        let queryData = await pool.query(query)
        // console.log(queryData.rows)
        returnData = queryData.rows
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}
sequenceModel.getCreditCardsSequenceByCardIssuer = async function (ci) {
    const query = `SELECT id,"CreditCardName",cardsequence from credit_cards where card_issuer=${ci} and published_at is not null`
    let returnData = []
    try {
        let queryData = await pool.query(query)
        // console.log(queryData.rows)
        returnData = queryData.rows
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}
sequenceModel.updateCardIssuerSequence = async function ({ applySequence, sequence }) {
    let returnData = false
    let applySequenceQuery = ``
    let sequenceQuery = ``
    let applySequenceRefreshQuery = `UPDATE public.card_issuers SET "ApplySequence"=null;`
    let sequenceRefreshQuery = `UPDATE public.card_issuers SET "sequence"=null;`
    applySequence.forEach((el, i) => {
        applySequenceQuery += `UPDATE public.card_issuers SET "ApplySequence"=${i + 1} WHERE id=${el.id};\n`
    })
    sequence.forEach((el, i) => {
        sequenceQuery += `UPDATE public.card_issuers SET "sequence"=${i + 1} WHERE id=${el.id};\n`
    })
    try {
        await pool.query(applySequenceRefreshQuery)
        await pool.query(sequenceRefreshQuery)
        await pool.query(applySequenceQuery)
        await pool.query(sequenceQuery)
        returnData = true
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}
sequenceModel.updateCreditCardsApplySequence = async function ({ applySequence }) {
    let returnData = false
    let applySequenceQuery = ``
    let applySequenceRefreshQuery = `UPDATE public.credit_cards SET "Applynowsequence"=null;`
    applySequence.forEach((el, i) => {
        applySequenceQuery += `UPDATE public.credit_cards SET "Applynowsequence"=${i + 1} WHERE id=${el.id};\n`
    })
    try {
        await pool.query(applySequenceRefreshQuery)
        await pool.query(applySequenceQuery)
        returnData = true
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}
sequenceModel.updateCreditCardsSequence = async function ({ cardIssuer, sequence }) {
    console.log({ cardIssuer, sequence })
    let returnData = false
    let sequenceQuery = ``
    let sequenceRefreshQuery = `UPDATE public.credit_cards SET "cardsequence"=null where  card_issuer=${cardIssuer}`
    sequence.forEach((el, i) => {
        sequenceQuery += `UPDATE public.credit_cards SET "cardsequence"=${i + 1} WHERE id=${el.id};\n`
    })
    try {
        await pool.query(sequenceRefreshQuery)
        await pool.query(sequenceQuery)
        returnData = true
    }
    catch (err) {
        console.log(err)
    }
    return returnData
}

module.exports = sequenceModel