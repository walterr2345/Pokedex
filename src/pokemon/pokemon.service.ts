import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

const BAD_REQUEST = 11000
const NUMBER_ZERO = 0

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(pagination: PaginationDto) {

    const { limit = 10, offset = NUMBER_ZERO } = pagination

    return await this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      }).select('-__v')
  }

  async findOne(term: string) {

    let pokemon: Pokemon

    if (!isNaN(+term) && !pokemon) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if (isValidObjectId(term) && !pokemon) {
      pokemon = await this.pokemonModel.findById(term)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with this id ${term} doesn't exits  `)
    }
    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
    }
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
    } catch (error) {
      this.handleExceptions(error)
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto }
  }

  async remove(term: string) {
    // const pokemon = await this.findOne(term)
    // await pokemon.deleteOne()
    // // await this.pokemonModel.remove(pokemon)

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: term })

    if (deletedCount === NUMBER_ZERO) {
      throw new BadRequestException(`Pokemon with this id ${term} doesn't exits`)
    }
    // const result = await this.pokemonModel.findByIdAndDelete(term)
    return
  }

  private handleExceptions(error: any) {
    if (error.code === BAD_REQUEST) {
      throw new BadRequestException(`Pokemon already exits in DB 
      ${JSON.stringify(error.keyValue)}`)
    }
  }
}
