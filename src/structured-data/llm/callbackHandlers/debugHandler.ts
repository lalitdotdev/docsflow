import { ChainCall, DebugReport } from '../dto/debug.dto';

import { BaseCallbackHandler } from 'langchain/callbacks';
import { ChainValues } from 'langchain/schema';
import { Serialized } from 'langchain/load/serializable';

export class DebugCallbackHandler extends BaseCallbackHandler {
  name = 'DebugCallbackHandler';

  private _debugReport: DebugReport;
  private _chainCallCount = 0;
  private _llmCallCount = 0;

  get debugReport() {
    return this._debugReport;
  }

  async handleChainStart(
    chain: Serialized,
    inputs: ChainValues,
    runId: string,
  ): Promise<void> {
    const startedChain: ChainCall = {
      chainName: chain.id.at(-1),
      runId,
      start: {
        inputs,
      },
      end: {
        outputs: null,
      },
      error: {
        err: null,
      },
    };

    this._debugReport = {
      chainCallCount: ++this._chainCallCount,
      llmCallCount: this._llmCallCount,
      chains: [...(this._debugReport?.chains ?? []), startedChain],
      llms: [...(this._debugReport?.llms ?? [])],
    };
  }
}
