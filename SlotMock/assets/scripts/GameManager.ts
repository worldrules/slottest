import Aux from './SlotEnum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
  public _lines = [Aux.Lines.Bottom, Aux.Lines.Middle, Aux.Lines.Upper];

  @property(cc.Node)
  machine = null;

  @property({ type: cc.AudioClip })
  audioClick = null;

  private block = false;

  private result = null;

  private resultLines = null;

  private oddsPreset = [50, 33, 10, 7];

  private oddsLookup = [];

  start(): void {
    this.machine.getComponent('Machine').createMachine();
  }

  update(): void {
    if (this.block && this.result != null) {
      this.informStop();
      this.result = null;
    }
  }

  click(): void {
    cc.audioEngine.playEffect(this.audioClick, false);

    if (this.machine.getComponent('Machine').spinning === false) {
      this.block = false;
      this.machine.getComponent('Machine').spin();
      this.requestResult();
    } else if (!this.block) {
      this.block = true;
      this.machine.getComponent('Machine').lock();
    }
  }

  async requestResult(): Promise<void> {
    this.result = null;
    this.result = await this.getAnswer();
  }

  getAnswer(): Promise<Array<Array<number>>> {
    const outcome: number = this.oddsLookup[Math.floor(Math.random() * this.oddsLookup.length)];

    const slotResult: Array<Array<number>> = this.createMockupResult(outcome);
    const selectedLines = [];
    return new Promise<Array<Array<number>>>(resolve => {
      const giro = Math.random();

      if (giro >= 0.5) {
        console.log('50% das tentativas');
      }
      if (giro >= 0.33) {
        console.log('33% das tentativas');
        selectedLines.push(this._lines[Math.floor(Math.random() * this._lines.length)]);
      }
      if (giro >= 0.1) {
        console.log('10% das tentativas');
        selectedLines.concat(this._lines).splice(Math.floor(Math.random() * this._lines.length), 1);
      }
      if (giro >= 0.07) {
        console.log('7% das tentativas');
        selectedLines.concat(this._lines);
      }
      setTimeout(() => {
        resolve(slotResult);
      }, giro);
    });
  }

  createMockupResult(outcome: number): Array<Array<number>> {
    const slotResult = [];
    const prize = Math.floor(Math.random() * this.machine.getComponent('Machine')._numberOfPrizes);
    const selectedLines = [];

    switch (outcome) {
      case Aux.Configuration.Random:
        break;
      case Aux.Configuration.Single:
        selectedLines.push(this._lines[Math.floor(Math.random() * this._lines.length)]);
        break;
      case Aux.Configuration.Double:
        selectedLines.concat(this._lines).splice(Math.floor(Math.random() * this._lines.length), 1);
        break;
      case Aux.Configuration.All:
        selectedLines.concat(this._lines);
        break;
      default:
    }

    this.resultLines = selectedLines;

    for (let i = 0; i < this.machine.getComponent('Machine')._numberOfReels; i += 1) {
      slotResult.push(this.getPrizeColumn(prize, selectedLines));
      slotResult.push(this.getPrizeColumn(prize, selectedLines));
      slotResult.push(this.getPrizeColumn(prize, selectedLines));
      slotResult.push(this.getPrizeColumn(prize, selectedLines));
      slotResult.push(this.getPrizeColumn(prize, selectedLines));
    }

    return slotResult;
  }

  getRandomColumn(): Array<number> {
    return new Array(this.machine.getComponent('Machine')._numberOfLines).map(() => -1);
  }

  getPrizeColumn(prize: number, lines: Array<number>): Array<number> {
    const column = this.getRandomColumn();
    lines.forEach(element => {
      column[element] = prize;
    });
    return column;
  }

  createOddsTable(): void {
    this.oddsLookup = [];
    this.oddsPreset.forEach((element, index) => {
      for (let i = 0; i < element; i += 1) {
        this.oddsLookup.push(index);
      }
    });
  }

  informStop(): void {
    const resultRelayed = this.result;
    this.machine.getComponent('Machine').stop(resultRelayed);
  }
}
