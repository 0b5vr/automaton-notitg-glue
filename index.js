const { NotITGExternal } = require( './NotITGExternal' );
const WebSocket = require( 'ws' );
const argv = require( 'argv' );

// == process argv =================================================================================
const args = argv.option( [
  {
    name: 'port',
    short: 'p',
    type: 'int'
  },
  {
    name: 'address',
    short: 'a',
    type: 'string'
  }
] ).run();

const port = process.env.PORT || args.options.port || 12250;
const address = parseInt( args.options.address ) || null;

// == websocket client =============================================================================
const url = `ws://localhost:${ port }`;
const client = new WebSocket( url );

client.on( 'open', () => {
  console.log( `Connected to ${ url }` );
} );

// == nitg external stuff ==========================================================================
let nitg;

( async () => {
  const processInfo = await NotITGExternal.scanAndFindNITG();

  nitg = new NotITGExternal( processInfo );
  await nitg.openProcess();

  if ( address != null ) {
    nitg.setAddress( address );
  } else {
    await nitg.findAddress();
  }
} )();

// == onexit =======================================================================================
process.on( 'exit', () => {
  if ( nitg ) {
    nitg.closeProcess();
  }

  console.log( 'Bye!' );
} );

process.on( 'SIGINT', () => process.exit( 0 ) );


// == update procedure =============================================================================
const update = async () => {
  if ( nitg ) {
    const v2 = await nitg.getExternal( 2 );
    const v3 = await nitg.getExternal( 3 );

    const time = v2 + 1E-6 * v3;

    if ( client.readyState === WebSocket.OPEN ) {
      client.send( JSON.stringify( { type: 'update', time } ) );
    }
  }

  setTimeout( update, 1000 / 60 );
};
update();
