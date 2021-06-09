const { ccclass } = cc._decorator;

enum Direction {
  Up,
  Down,
}

enum Configuration {
  Random,
  Single,
  Double,
  All,
}
enum Lines {
  Upper,
  Middle,
  Bottom,
}

@ccclass
export default class SlotEnum extends cc.Component {
  static Direction = Direction;

  static Configuration = Configuration;

  static Lines = Lines;
}
