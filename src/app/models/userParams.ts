// Class for providing parameters for searching users
export class UserParams {
  gender: string;
  maxAge: number;
  minAge: number;

  constructor(
    targetMinimumage: number = 18,
    targetMaximumAge: number = 99,
    targetGender: string = ''
  ) {
    this.minAge = targetMinimumage;
    this.maxAge = targetMaximumAge;
    this.gender = targetGender;
  }
}
