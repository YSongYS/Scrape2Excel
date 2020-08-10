const HTMLParser = require('node-html-parser')
const fetch = require('node-fetch')
const fs = require('fs')
const excel = require('excel4node')

let root;
const url = "https://dontstarve.fandom.com/wiki/Crafting#Don't%20Starve%20Together"
const urlWIKI = "https://dontstarve.fandom.com"

var workbook = new excel.Workbook()
var worksheet = workbook.addWorksheet('Assets')


fetch(`${url}`)
  .then (res => res.text())
  .then (body => root = HTMLParser.parse(body))
  .then (() => extractData(root))

function extractData(root){
var allAssets = []
  var rowCount = 1
  //getting the full list of assets and their fandom wiki links
  const optionType = root.querySelectorAll('table')[4].querySelectorAll('tr')
  //var optionAssetLinks = []
  optionType.forEach(function(e,i){
    if(i>=1){
      // skip the first tr, which is the table column label
      var optionTier = e.querySelectorAll('td')
      optionTier.forEach(function(x,j){
        if(j>=1 && x.outerHTML!=="<td>\n</td>"){
          //skip the first td, which is the table row label
          //strip the empty tds
          var optionAsset = x. querySelectorAll('a')
          optionAsset.forEach(function(y,k){

            var optionAssetLink = y.getAttribute('href')
            var urlWIKIasset = urlWIKI.concat(optionAssetLink)
            fetch(`${urlWIKIasset}`)
              .then (res => res.text())
              .then (body => root = HTMLParser.parse(body))
              .then (() => extractAssetData(root))

            /// extracting asset data
            function extractAssetData(root){
              var assetInfo = []
              const assetCards = root.querySelectorAll('aside')
              var assetNameList = []
              assetCards.forEach(function(z,n){
              const assetContent = z.querySelector('div').querySelector('div')
              const assetName = z.querySelector('h2').text

              const assetIngredients = assetContent.querySelectorAll('a')
              // assetInfo.push(assetName)
              // get quantity of ingridients
              var textQuantity = assetContent.text
              var numberQuantity = []
              for(i=0;i<textQuantity.length;i++){
                if(textQuantity[i]=="×"){
                  if (parseInt(textQuantity[i+2])) {
                    numberQuantity.push(parseInt(textQuantity[i+1].concat(textQuantity[i+2])))
                  } else {
                    numberQuantity.push(parseInt(textQuantity[i+1]))
                  }
                }
              }
              // get individual ingridients and log everything into the assetInfo
              if (!assetNameList.includes(assetName)) {
                assetNameList.push(assetName)
                assetIngredients.forEach(function(e,i){
                  worksheet.cell(rowCount,1).string(assetName)
                  worksheet.cell(rowCount,2).number(numberQuantity[i])
                  worksheet.cell(rowCount,3).string(e.getAttribute('title'))
                  rowCount+=1
                  console.log(rowCount)
                })
                workbook.write('ohyeah.xlsx');
              }

            })
            }

          })
        }
      })
    }
  })
  //console.log(allAssets)
}
