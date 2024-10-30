const filePath = 'mydiary/list'
const fileFirstName = 'mydiary'
const className = '日记'
const saveFile = async markdownContent => {
  const fileSystemEntry = await getFileSystem()
  if (fileSystemEntry) {
    try {
      const res = await createFile(fileSystemEntry, markdownContent, `${fileFirstName}-${className}-${new Date().getTime()}.md`)
      return res
    } catch (e) {
      console.error(e)
      return false
    }
  } else {
    return false
  }
}

const getFileSystem = (directory: 'PRIVATE_WWW' | 'PRIVATE_DOC' | 'PUBLIC_DOCUMENTS' | 'PUBLIC_DOWNLOADS' = 'PRIVATE_DOC') => {
  return new Promise((resolve, reject) => {
    try {
      // 检查是否在 App 环境中
      if (typeof plus === 'undefined') {
        console.error('plus 对象未定义，可能不在 App 环境中')
        uni.showToast({
          title: '当前环境不支持此操作',
          icon: 'none',
          duration: 2000
        })
        reject(new Error('当前环境不支持此操作'))
      }

      // 获取文件系统管理器
      const fs = plus.io

      // 指定保存路径
      // const path = filePath + '_doc/generated_file.md';
      fs.requestFileSystem(
        fs[directory],
        function (entry) {
          resolve(entry)
          // createFile(entry, markdownContent, `${fileFirstName}-${className}-${new Date().getTime()}.md`)
        },
        error => {
          uni.showToast({
            title: '获取文件系统失败',
            icon: 'none',
            duration: 2000
          })
          reject(error)
        }
      )
    } catch (error) {
      console.error('获取文件系统失败:', error)
      reject(error)
    }
  })
}

/**
 * 保存文件
 * @param {*} fsEntry
 * @param {*} markdownContent
 * @param {*} fileName
 */
const createFile = (fsEntry, markdownContent, fileName) => {
  return new Promise((resolve, reject) => {
    fsEntry.root.getDirectory(
      filePath,
      { create: true },
      entry => {
        entry.getFile(
          fileName,
          { create: true },
          fileEntry => {
            fileEntry.createWriter(
              fileWriter => {
                // 将 Markdown 文本写入文件
                fileWriter.write(markdownContent)
                fileWriter.onwrite = () => {
                  console.log('文件保存成功', entry.toLocalURL())
                  resolve({ path: fileEntry.toLocalURL(), name: fileName })
                  uni.showToast({
                    title: '文件保存成功',
                    icon: 'success',
                    duration: 2000
                  })
                }
                fileWriter.onerror = err => {
                  reject(err)
                  uni.showToast({
                    title: '写入文件失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              },
              err => {
                reject(err)
                uni.showToast({
                  title: '创建文件失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            )
          },
          err => {
            reject(err)
            uni.showToast({
              title: '获取文件失败',
              icon: 'none',
              duration: 2000
            })
          }
        )
      },
      err => {
        reject('创建或打开文件目录失败')
      }
    )
  })
}

/**
 * 根据path读取文件
 */
const readFile = async path => {
  const fileReader = new plus.io.FileReader()
  return new Promise((resolve, reject) => {
    fileReader.onload = function (e) {
      resolve(e.target.result)
    }
    fileReader.onerror = function (e) {
      reject(e)
    }
    fileReader.readAsText(path)
  })
}

/**
 * 根据path和content更新文件
 */
const updateFile = async (path, content) => {
  const fileWriter = new plus.io.FileWriter(path)
  return new Promise((resolve, reject) => {
    fileWriter.onwriteend = function (e) {
      resolve(e)
    }
    fileWriter.onerror = function (e) {
      reject(e)
    }
    fileWriter.write(content)
  })
}

/**
 * 根据path删除文件
 */
const deleteFile = async path => {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      path,
      function (entry) {
        entry.remove(
          function () {
            resolve({ success: true })
          },
          function (e) {
            reject({ success: false, msg: e.massage || e })
          }
        )
      },
      function (e) {
        reject({ success: false, msg: e.massage || e })
      }
    )
  })
}


/**
 * 根据path 移动文件到新的path
 */
const copyFile = async (name,oldPath, newPath?) => {
  const fileEntry:PlusIoDirectoryEntry = await getFileSystem('PRIVATE_DOC')
  console.log('fileEntry', fileEntry.root.fullPath,oldPath)
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      oldPath,
      function (entry) {
        console.log('entry', entry.fullPath)
        entry.copyTo(
          fileEntry.root,
          `${new Date().getTime()}${name}`,
          function (entry) {
            resolve({ success: true,entry:entry })
          },
          function (e) {
			  console.error(e)
            reject({ success: false, msg: e.massage || e })
          }
        )
      },
      function (e) {
        reject({ success: false, msg: e.massage || e })
      }
    )
  })
}
/**
 * 获取目录
 * getMetadata( successCB, errorCB, recursive );
 * succesCB: ( MetadataSuccessCallback ) 必选 获取文件或目录属性信息成功的回调
errorCB: ( FileErrorCallback ) 必选 获取文件或目录属性信息失败的回调
recursive: ( Boolean ) 必选 是否递归计算目录信息 true为递归计算获取信息，false不递归计算获取，默认值为false。
 */
const getMata = async (directoryEntry) => {
  return new Promise((resolve, reject) => {
    directoryEntry.getMetadata(
      metadata => {
        /**
         * modificationTime: (Date 类型 )文件或目录的最后修改时间
size: (Number 类型 )文件的大小
若获取的是目录对象的属性则值为0。

directoryCount: (Number 类型 )包含的子目录数
若自身是文件则其值为0。

fileCount: (Number 类型 )目录的文件数
若自身是文件则其值为0。
         */
        const mata = {
          modificationTime: metadata.modificationTime,
          size: metadata.size,
          directoryCount: metadata.directoryCount,
          fileCount: metadata.fileCount
        }
        resolve(mata);
      }, error => {
        console.error('getMetadata error::', directoryEntry.name)
        const mata = {
          modificationTime: null,
          size: null,
          directoryCount: null,
          fileCount: null
        }
        resolve(mata);
        console.error(error)
        // reject(error)
      }, false
    )
  });
}

const getDirectionInfo = async (entries) => {
  let dirctionList = [];
  if (entries.length) {
    dirctionList = await Promise.all(entries.map(async (itemEntry) => {
      console.log(itemEntry.name)
      let mata: any = {}
      // 如果不是以.md结尾的文件，不显示
      if (itemEntry.isFile && !itemEntry.name.endsWith('.md')) {
        return;
      }
      mata = await getMata(itemEntry)
      // const mata = await getMata(itemEntry)
      const item = {
        name: itemEntry.name,
        fullPath: itemEntry.fullPath,
        isFile: itemEntry.isFile,
        isDirectory: itemEntry.isDirectory,
        ...mata || {},
      }
      console.log(item)
      return item;
    }))
  }
	dirctionList = dirctionList.filter(item =>{
		if(item){
			return item
		}
	})
	console.log('dirctionlist:', dirctionList)
  return dirctionList;
}
/**
 * 
 * @param name 文件夹名称 默认为 Documents Download
 * @returns 
 */
const getDirection = (name = 'Documents') => {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      `file:///storage/emulated/0/${name}`,
      function (entry) {
        const directoryReader = entry.createReader()
        console.log(entry.name, entry.fullPath, entry.fileSystem)
        directoryReader.readEntries(
          function (entries) {
            console.log('entries1:', entries)

            const dirctionList = [];
            getDirectionInfo(entries).then(list => {
              dirctionList.push(...list)
              resolve(dirctionList)
            }).catch(err => {
              console.log('err', err)
              reject(err)
            })
            console.log(dirctionList)
          },
          function (error) {
            console.error('读取目录失败: ' + error.message)
            reject(error)
          }
        )
      },
      error => {
        reject(error)
      }
    )
  })
}
const testFileOp = async () => {
  const fs = plus.io
  const fileSystemEntry = () => {
    return new Promise((reslove, reject) => {
      // fs.resolveLocalFileSystemURL("file:///storage/emulated/0/Documents", function (entry) {
      fs.resolveLocalFileSystemURL(
        '/storage/emulated/0/Download',
        function (entry) {
          const directoryReader = entry.createReader()
          console.log(entry.name, entry.fullPath, entry.fileSystem)
          directoryReader.readEntries(
            function (entries) {
              console.log('entries1:', entries)
              entries.forEach(function (entry) {
                console.log(entry.name)
              })
            },
            function (error) {
              console.error('读取目录失败: ' + error.message)
            }
          )
          reslove(entry)
        },
        error => {
          reject(error)
        }
      )
    })
  }
  fileSystemEntry().then(entry => {
    console.log('entry:', entry, entry.toLocalURL)
    const directoryReader = entry.createReader()
    directoryReader.readEntries(
      function (entries) {
        console.log('entries:', entries)
      },
      function (error) {
        console.error('读取目录失败: ' + error.message)
      }
    )
  })
}

export { saveFile, testFileOp, readFile, updateFile, deleteFile, getDirection, copyFile }
