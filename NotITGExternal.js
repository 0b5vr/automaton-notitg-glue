const memoryjs = require( 'memoryjs' );
const { promisify } = require( 'util' );

// Ref: https://github.com/Jaezmien/NotITG-External/blob/master/notitg.js

const magic = 'ADC00800' + '00000000'.repeat( 63 );

class NotITGExternal {
  constructor( processInfo ) {
    this.__processInfo = processInfo;
    this.__process = null;
    this.__address = null;
  }

  async openProcess() {
    this.__process = await promisify( memoryjs.openProcess )(
      this.__processInfo.th32ProcessID
    );
  }

  async closeProcess() {
    memoryjs.closeProcess( this.__process.handle );
    this.__process = null;
  }

  setAddress( address ) {
    this.__address = address;
  }

  async findAddress() {
    this.__address = await promisify( memoryjs.findPattern )(
      this.__process.handle,
      this.__process.szExeFile,
      magic,
      memoryjs.NORMAL,
      0,
      0
    );
    console.log( `Found an address: 0x${ this.__address.toString( 16 ) }` );
  }

  async setExternal( index, value ) {
    if ( this.__process == null ) {
      throw new Error( 'You must open the process first!' );
    }
    if ( this.__address == null ) {
      throw new Error( 'You must find an address first!' );
    }
    if ( index < 0 || index > 63 ) {
      throw new Error( `Index must be 0-63! Got ${ index }` );
    }
    if ( value < -2147483648 || value > 2147483647 ) {
      throw new Error( `Value must be 4-byte int! Got ${ value }` );
    }

    await promisify( memoryjs.writeMemory )(
      this.__process.handle,
      this.__address + ( index * 4 ),
      memoryjs.INT
    );
  }

  async getExternal( index ) {
    if ( this.__process == null ) {
      throw new Error( 'You must open the process first!' );
    }
    if ( this.__address == null ) {
      throw new Error( 'You must find an address first!' );
    }
    if ( index < 0 || index > 63 ) {
      throw new Error( `Index must be 0-63! Got ${ index }` );
    }

    return await promisify( memoryjs.readMemory )(
      this.__process.handle,
      this.__address + ( index * 4 ),
      memoryjs.INT
    );
  }
}

NotITGExternal.scanAndFindNITG = async function() {
  const processes = await promisify( memoryjs.getProcesses )();
  for ( const process of processes ) {
    if ( process.szExeFile.match( /^NotITG/i ) ) {
      return process;
    }
  }
}

module.exports = {
  NotITGExternal
};
